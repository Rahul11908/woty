import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

const hostedBySponsors: Sponsor[] = [
  { id: '11', name: 'Día Restaurant & Lounge', logo: '/sponsors/dia.jpg', website: 'https://www.diarestaurant.ca/' },
  { id: '12', name: 'Canopy Toronto | Yorkville', logo: '/sponsors/canopy.jpg', website: 'https://www.hilton.com/en/hotels/ytzpypy-canopy-toronto-yorkville/' },
];

const sponsors: Sponsor[] = [
  { id: '3', name: 'Bulova', logo: '/sponsors/bulova.jpg', website: 'https://www.bulova.com/ca/en/home' },
  { id: '4', name: 'Olly', logo: '/sponsors/olly.jpg', website: 'https://www.ollynutrition.ca/' },
  { id: '2', name: 'Cinderella Stories', logo: '/sponsors/cinderella-stories.jpg', website: 'https://podcasts.apple.com/ca/podcast/the-glory-sports-podcast-network/id1833074258' },
  { id: '1', name: 'Toronto Tempo', logo: '/sponsors/toronto-tempo.jpg', website: 'https://tempo.wnba.com/' },
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
        {/* Hosted By Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Hosted by</h2>
          <div className="flex flex-col gap-3">
            {hostedBySponsors.map((sponsor) => (
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

        {/* Sponsors Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Sponsored by</h2>
        </div>

        <div className="flex flex-col gap-3">
          {sponsors.map((sponsor) => (
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
      </main>
    </div>
  );
}
