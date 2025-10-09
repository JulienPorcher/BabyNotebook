/**
 * Supabase Edge Function for Thumbnail Generation
 * 
 * This function handles server-side image processing to generate
 * multiple quality versions of uploaded images.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThumbnailRequest {
  originalPath: string;
  qualities: Array<{
    quality: string;
    size: number;
  }>;
}

interface ThumbnailResponse {
  thumbnailPath: string;
  previewPath: string;
  mediumPath: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { originalPath, qualities }: ThumbnailRequest = await req.json();

    if (!originalPath) {
      throw new Error('Original path is required');
    }

    // Download original image
    const { data: originalData, error: downloadError } = await supabaseClient.storage
      .from('photos')
      .download(originalPath);

    if (downloadError) {
      throw new Error(`Failed to download original image: ${downloadError.message}`);
    }

    const originalBlob = await originalData.arrayBuffer();
    const originalUint8Array = new Uint8Array(originalBlob);

    // Generate thumbnails for each quality
    const thumbnailPaths: Record<string, string> = {};

    for (const { quality, size } of qualities) {
      try {
        // Generate thumbnail using WebAssembly image processing
        const thumbnailData = await generateThumbnail(originalUint8Array, size);
        
        // Create thumbnail path
        const pathParts = originalPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const nameWithoutExt = fileName.split('.')[0];
        const extension = fileName.split('.').pop();
        const thumbnailPath = `${pathParts.slice(0, -1).join('/')}/${nameWithoutExt}_${quality}.${extension}`;

        // Upload thumbnail
        const { error: uploadError } = await supabaseClient.storage
          .from('photos')
          .upload(thumbnailPath, thumbnailData, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload ${quality} thumbnail:`, uploadError);
          continue;
        }

        thumbnailPaths[quality] = thumbnailPath;
      } catch (error) {
        console.error(`Failed to generate ${quality} thumbnail:`, error);
      }
    }

    // Update database with thumbnail paths
    const { error: updateError } = await supabaseClient
      .from('photos')
      .update({
        thumbnail_path: thumbnailPaths.thumbnail,
        preview_path: thumbnailPaths.preview,
        medium_path: thumbnailPaths.medium,
        updated_at: new Date().toISOString()
      })
      .eq('path', originalPath);

    if (updateError) {
      console.error('Failed to update database with thumbnail paths:', updateError);
    }

    const response: ThumbnailResponse = {
      thumbnailPath: thumbnailPaths.thumbnail || '',
      previewPath: thumbnailPaths.preview || '',
      mediumPath: thumbnailPaths.medium || ''
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in thumbnail generation:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Generate thumbnail using WebAssembly image processing
 * This is a simplified version - in production, you'd use a proper image processing library
 */
async function generateThumbnail(
  originalData: Uint8Array, 
  targetSize: number
): Promise<Uint8Array> {
  try {
    // Create a canvas to process the image
    const canvas = new OffscreenCanvas(targetSize, targetSize);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Create image from original data
    const blob = new Blob([originalData]);
    const imageUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          let drawWidth = targetSize;
          let drawHeight = targetSize;
          
          if (aspectRatio > 1) {
            drawHeight = targetSize / aspectRatio;
          } else {
            drawWidth = targetSize * aspectRatio;
          }
          
          const x = (targetSize - drawWidth) / 2;
          const y = (targetSize - drawHeight) / 2;
          
          // Draw image
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Convert to JPEG with compression
          canvas.convertToBlob({ 
            type: 'image/jpeg', 
            quality: 0.8 
          }).then(blob => {
            blob.arrayBuffer().then(buffer => {
              URL.revokeObjectURL(imageUrl);
              resolve(new Uint8Array(buffer));
            });
          });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}
