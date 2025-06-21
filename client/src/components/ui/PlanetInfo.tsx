import { X } from "lucide-react";
import { PlanetData } from "../../lib/solarSystemData";
import { useSolarSystem } from "../../hooks/useSolarSystem";

interface PlanetInfoProps {
  planet: PlanetData;
}

export default function PlanetInfo({ planet }: PlanetInfoProps) {
  const { setSelectedPlanet } = useSolarSystem();

  const handleClose = () => {
    setSelectedPlanet(null);
  };

  const getDisplayName = (name: string) => {
    // Remove prefix codes (S-, P-, H-, G-) from planet names
    return name.replace(/^[SPHG]-/, '');
  };

  const getFullTypeName = (type: string) => {
    switch (type) {
      case 'S': return 'Star';
      case 'P': return 'Planet';
      case 'H': return 'Habitable';
      case 'G': return 'Gas';
      default: return type;
    }
  };

  return (
    <div className="fixed top-4 left-4 w-72 md:w-72 sm:w-46 bg-black/90 border border-gray-600 text-white rounded-xl shadow-lg backdrop-blur-sm z-50">
      <div className="pb-2 md:pb-3 sm:pb-1 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-lg sm:text-sm font-semibold">{getDisplayName(planet.name)}</h3>
          <div className="flex items-center gap-1 md:gap-2 sm:gap-1">
            <span className="bg-gray-700 text-white text-xs md:text-xs sm:text-xs px-2 py-1 rounded-md">
              {getFullTypeName(planet.type)}
            </span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2 md:space-y-3 sm:space-y-1 p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 md:gap-3 sm:gap-1 text-sm md:text-sm sm:text-xs">
          <div>
            <span className="text-gray-400 text-xs md:text-xs sm:text-xs">Period:</span>
            <div className="font-medium text-xs md:text-sm sm:text-xs">{planet.orbitalPeriod}y</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs md:text-xs sm:text-xs">Temp:</span>
            <div className="font-medium text-xs md:text-sm sm:text-xs">{planet.temperature}K</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs md:text-xs sm:text-xs">Size:</span>
            <div className="font-medium text-xs md:text-sm sm:text-xs">{planet.size.toFixed(1)}</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs md:text-xs sm:text-xs">Gravity:</span>
            <div className="font-medium text-xs md:text-sm sm:text-xs">{planet.gravity}</div>
          </div>
        </div>
        
        {planet.description && (
          <div className="pt-1 md:pt-2 sm:pt-1 border-t border-gray-700">
            <span className="text-gray-400 text-xs">Description:</span>
            <p className="text-sm md:text-sm sm:text-xs mt-1 text-gray-200 leading-tight">{planet.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
