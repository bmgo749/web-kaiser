import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { useSolarSystem } from "../../hooks/useSolarSystem";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function TimeControls() {
  const { 
    timeScale, 
    setTimeScale, 
    isPaused, 
    setIsPaused, 
    resetTime 
  } = useSolarSystem();

  const timeScales = [0.1, 0.5, 1, 2, 5, 10, 50, 100, 500, 1000];
  const currentScaleIndex = timeScales.findIndex(scale => scale === timeScale);

  const handleScaleChange = (value: number[]) => {
    setTimeScale(timeScales[value[0]]);
  };

  return (
    <Card className="w-64 bg-black/80 border-gray-600 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Time Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Play/Pause/Reset */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1"
            variant={isPaused ? "default" : "secondary"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            onClick={resetTime}
            variant="outline"
            className="border-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Time Scale Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Speed</span>
            <span>{timeScale}x</span>
          </div>
          <Slider
            value={[currentScaleIndex]}
            onValueChange={handleScaleChange}
            max={timeScales.length - 1}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1x</span>
            <span>1000x</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
