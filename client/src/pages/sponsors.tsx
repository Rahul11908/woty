import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";
import bossLogo from "@assets/BOSS_LOGO_white_RGB_1752004469108.png";
import rabanneLogo from "@assets/image-7_1752004469108.png";
import suttonPlaceHotelLogo from "@assets/SPH-Toronto_logo_Toronto_white_stacked_1752004469108.png";
import asahiLogo from "@assets/ASD_LOGO_NEGATIVE_RGB_1752004822019.png";
import rootsLogo from "@assets/Asset 1_1752004822019.png";
import hennessyLogo from "@assets/hennessy-new-logo.png";
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

const sponsors: Sponsor[] = [
  {
    id: "ge",
    name: "GE Appliances",
    website: "https://www.geappliances.com",
    brandColor: "bg-blue-600",
    textColor: "text-white",
    logoSvg: `<img src="${geAppliancesLogo}" alt="GE Appliances" className="w-full h-full object-contain" />`,
    isMainSponsor: true
  },
  {
    id: "asahi",
    name: "Asahi",
    website: "https://www.asahibeer.com",
    brandColor: "bg-red-600",
    textColor: "text-white",
    logoSvg: `<img src="${asahiLogo}" alt="Asahi" className="w-full h-full object-contain" />`
  },
  {
    id: "boss",
    name: "BOSS",
    website: "https://www.boss.info",
    brandColor: "bg-black",
    textColor: "text-white",
    logoSvg: `<img src="${bossLogo}" alt="BOSS" className="w-full h-full object-contain" />`
  },
  {
    id: "roots",
    name: "Roots",
    website: "https://www.roots.com",
    brandColor: "bg-green-700",
    textColor: "text-white",
    logoSvg: `<img src="${rootsLogo}" alt="Roots" className="w-full h-full object-contain" />`
  },
  {
    id: "mas",
    name: "Mas+",
    website: "https://www.masplus.com",
    brandColor: "bg-orange-500",
    textColor: "text-white",
    logoSvg: `<img src="${masByMessiLogo}" alt="Mas+ by Messi" className="w-full h-full object-contain" />`
  },
  {
    id: "rabanne",
    name: "Rabanne",
    website: "https://www.rabanne.com",
    brandColor: "bg-purple-700",
    textColor: "text-white",
    logoSvg: `<img src="${rabanneLogo}" alt="Rabanne" className="w-full h-full object-contain" />`
  },
  {
    id: "hennessy",
    name: "Hennessy",
    website: "https://www.hennessy.com",
    brandColor: "bg-amber-600",
    textColor: "text-white",
    logoSvg: `<img src="${hennessyLogo}" alt="Hennessy" className="w-full h-full object-contain" />`
  },
  {
    id: "rado",
    name: "Rado",
    website: "https://www.rado.com",
    brandColor: "bg-gray-800",
    textColor: "text-white",
    logoSvg: `<img src="${radoLogo}" alt="Rado Switzerland" className="w-full h-full object-contain" />`
  }
];

export default function Sponsors() {
  const handleSponsorClick = (website: string) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Sponsors</h1>
          </div>
          <div className="w-32 h-14">
            <img 
              src={gloryLogo} 
              alt="GLORY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="pt-6 px-4">
        <div className="space-y-6">

          {/* Main Sponsor - GE (1.5x larger) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Powered By</h3>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full h-32"
              onClick={() => handleSponsorClick(sponsors[0].website)}
            >
              <CardContent className={`${sponsors[0].brandColor} ${sponsors[0].textColor} h-full flex items-center justify-center rounded-lg px-6 py-4`}>
                <div className="w-72 h-20" dangerouslySetInnerHTML={{ __html: sponsors[0].logoSvg }} />
              </CardContent>
            </Card>
          </div>

          {/* Other Sponsors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Event Partners</h3>
            <div className="space-y-3">
              {sponsors.slice(1).map((sponsor) => (
                <Card 
                  key={sponsor.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full h-20"
                  onClick={() => handleSponsorClick(sponsor.website)}
                >
                  <CardContent className={`${sponsor.brandColor} ${sponsor.textColor} h-full flex items-center justify-center rounded-lg px-6 py-4`}>
                    <div className={`flex items-center justify-center ${
                      sponsor.id === 'rabanne' ? 'w-40 h-14' : 
                      sponsor.id === 'asahi' ? 'w-48 h-18' : 
                      sponsor.id === 'roots' ? 'w-32 h-12' : 
                      sponsor.id === 'hennessy' ? 'w-36 h-12' : 
                      sponsor.id === 'rado' ? 'w-32 h-12' : 
                      'w-32 h-12'
                    }`} dangerouslySetInnerHTML={{ __html: sponsor.logoSvg }} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 text-center">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="text-lg font-bold italic text-gray-900 mb-2">
                  Thank You to Our Sponsors
                </h3>
                <p className="text-gray-600 font-bold italic">
                  The GLORY Sports Summit 2025 is made possible by the generous support of our sponsors. 
                  Their commitment to advancing sports innovation and community building makes this event extraordinary.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}