import { useState, useEffect } from "react";

interface BreastFormProps {
  onSubmit: (data: { leftTime: number; rightTime: number; totalTime: number; comment: string }) => void;
  onClose: () => void;
}

export default function BreastForm({ onSubmit, onClose }: BreastFormProps) {
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [isLeftActive, setIsLeftActive] = useState(false);
  const [isRightActive, setIsRightActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState("");
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [customLeftTime, setCustomLeftTime] = useState(0);
  const [customRightTime, setCustomRightTime] = useState(0);

  const totalTime = leftTime + rightTime;

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if ((isLeftActive || isRightActive) && !isPaused) {
      interval = setInterval(() => {
        if (isLeftActive) {
          setLeftTime(prev => prev + 1);
        }
        if (isRightActive) {
          setRightTime(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLeftActive, isRightActive, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeftClick = () => {
    if (isRightActive) {
      setIsRightActive(false);
    }
    setIsLeftActive(!isLeftActive);
    setIsPaused(false);
  };

  const handleRightClick = () => {
    if (isLeftActive) {
      setIsLeftActive(false);
    }
    setIsRightActive(!isRightActive);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setLeftTime(0);
    setRightTime(0);
    setIsLeftActive(false);
    setIsRightActive(false);
    setIsPaused(false);
  };

  const handleSetTime = () => {
    setLeftTime(customLeftTime);
    setRightTime(customRightTime);
    setShowTimeSettings(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      leftTime,
      rightTime,
      totalTime,
      comment
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">Allaitement</h2>

        {/* Time Settings Modal */}
        {showTimeSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-xl p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Définir les temps</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Temps gauche (minutes)</label>
                  <input
                    type="number"
                    value={customLeftTime}
                    onChange={(e) => setCustomLeftTime(Number(e.target.value))}
                    className="w-full border rounded-lg p-2"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Temps droite (minutes)</label>
                  <input
                    type="number"
                    value={customRightTime}
                    onChange={(e) => setCustomRightTime(Number(e.target.value))}
                    className="w-full border rounded-lg p-2"
                    min="0"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSetTime}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => setShowTimeSettings(false)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left and Right Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleLeftClick}
            className={`p-4 rounded-xl text-white font-semibold ${
              isLeftActive ? 'bg-pink-500' : 'bg-pink-200'
            }`}
          >
            Gauche
          </button>
          <button
            onClick={handleRightClick}
            className={`p-4 rounded-xl text-white font-semibold ${
              isRightActive ? 'bg-pink-500' : 'bg-pink-200'
            }`}
          >
            Droite
          </button>
        </div>

        {/* Timers */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-mono font-bold">{formatTime(leftTime)}</div>
            <div className="text-sm text-gray-600">Gauche</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold">{formatTime(rightTime)}</div>
            <div className="text-sm text-gray-600">Droite</div>
          </div>
        </div>

        {/* Total Timer */}
        <div className="text-center border-t pt-4">
          <div className="text-3xl font-mono font-bold text-pink-600">{formatTime(totalTime)}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTimeSettings(true)}
            className="flex-1 bg-gray-200 py-2 rounded-lg"
          >
            Définir temps
          </button>
          {totalTime > 0 && (
            <>
              <button
                onClick={handlePause}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
              >
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Comment Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Commentaire</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Commentaire..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-2 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-pink-500 text-white py-2 rounded-lg"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
