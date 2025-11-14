import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import gloryLogo from "@assets/GLORY WOTY_1762527738446.png";
import bossLogo from "@assets/BOSS_LOGO_white_RGB_1752004469108.png";
import rabanneLogo from "@assets/image - Edited_1752168892219.png";
import suttonPlaceHotelLogo from "@assets/SPH-Toronto_logo_Toronto_white_stacked_1752004469108.png";
import asahiLogo from "@assets/ASD_LOGO_NEGATIVE_RGB_1752004822019.png";
import rootsLogo from "@assets/Asset 1_1752004822019.png";
import hennessyLogo from "@assets/hennessy-final-logo.png";
import masByMessiLogo from "@assets/mas-plus-logo.webp";
import radoLogo from "@assets/rado-new-logo.png";
import geAppliancesLogo from "@assets/GEAppliances_PrimaryLogo_1752003391719.png";

interface Sponsor {
  id: string;
  name: string;
  website: string;
  brandColor: string;
  textColor: string;
  logoSvg: string;
  isMainSponsor?: boolean;
}

const sponsors: Sponsor[] = [];

export default function Sponsors() {
  const handleSponsorClick = (website: string) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pb-20 relative z-10">
      {/* Header */}
      <header className="glass-card border-b border-white/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-teal rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Sponsors</h1>
          </div>
          <div className="w-32 h-14">
            <img 
              src={gloryLogo} 
              alt="GLORY Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </header>

      <main className="pt-6 px-4">
        <div className="space-y-6">
          {sponsors.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-600">
                  Sponsor information will be updated soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Sponsor */}
              {sponsors.filter(s => s.isMainSponsor).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Powered By</h3>
                  {sponsors.filter(s => s.isMainSponsor).map((sponsor) => (
                    <Card 
                      key={sponsor.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full h-36"
                      onClick={() => handleSponsorClick(sponsor.website)}
                    >
                      <CardContent className={`${sponsor.brandColor} ${sponsor.textColor} h-full flex items-center justify-center rounded-lg px-8 py-6`}>
                        <div className="w-80 h-24 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: sponsor.logoSvg }} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Other Sponsors */}
              {sponsors.filter(s => !s.isMainSponsor).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Event Partners</h3>
                  <div className="space-y-3">
                    {sponsors.filter(s => !s.isMainSponsor).map((sponsor) => (
                      <Card 
                        key={sponsor.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full h-20"
                        onClick={() => handleSponsorClick(sponsor.website)}
                      >
                        <CardContent className={`${sponsor.brandColor} ${sponsor.textColor} h-full flex items-center justify-center rounded-lg px-6 py-4`}>
                          <div className="w-32 h-12 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: sponsor.logoSvg }} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}