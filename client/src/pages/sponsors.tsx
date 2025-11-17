import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import torontoTempoLogo from "@assets/3_1763401906247.jpg";
import cinderellaStoriesLogo from "@assets/4_1763401906248.jpg";
import bulovaLogo from "@assets/5_1763401906249.jpg";
import ollyLogo from "@assets/6_1763401906249.jpg";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

const mainSponsors: Sponsor[] = [
  { id: '1', name: 'Toronto Tempo', logo: torontoTempoLogo, website: 'https://tempo.wnba.com/' },
  { id: '2', name: 'Cinderella Stories', logo: cinderellaStoriesLogo, website: 'https://podcasts.apple.com/ca/podcast/the-glory-sports-podcast-network/id1833074258' },
];

const sponsoredBySponsors: Sponsor[] = [
  { id: '3', name: 'Bulova', logo: bulovaLogo, website: 'https://www.bulova.com/ca/en/home' },
  { id: '4', name: 'Olly', logo: ollyLogo, website: 'https://www.ollynutrition.ca/' },
];

export default function Sponsors() {
  const handleSponsorClick = (sponsor: Sponsor) => {
    if (sponsor.website) {
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen pb-20 relative z-10 bg-gradient-to-br from-purple-500 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sponsors</h1>
            <p className="text-sm text-white/90">Our valued partners</p>
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        {/* Main Sponsors */}
        <div className="flex flex-col gap-3 mb-6">
          {mainSponsors.map((sponsor) => (
            <Card 
              key={sponsor.id} 
              className="bg-black shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105 overflow-hidden"
              onClick={() => handleSponsorClick(sponsor)}
              data-testid={`card-sponsor-${sponsor.id}`}
            >
              <CardContent className="p-0 aspect-video flex items-center justify-center">
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name}
                  className="w-full h-full object-contain p-4"
                  data-testid={`img-sponsor-${sponsor.id}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sponsored By Section */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Sponsored by</h2>
          <div className="flex flex-col gap-3">
            {sponsoredBySponsors.map((sponsor) => (
              <Card 
                key={sponsor.id} 
                className="bg-black shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105 overflow-hidden"
                onClick={() => handleSponsorClick(sponsor)}
                data-testid={`card-sponsor-${sponsor.id}`}
              >
                <CardContent className="p-0 aspect-video flex items-center justify-center">
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name}
                    className="w-full h-full object-contain p-4"
                    data-testid={`img-sponsor-${sponsor.id}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
