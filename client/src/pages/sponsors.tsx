import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";
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
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <circle cx="20" cy="20" r="12" fill="white"/>
      <text x="20" y="25" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#dc2626">朝日</text>
      <text x="65" y="18" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">ASAHI</text>
      <text x="65" y="30" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="white">BEER</text>
    </svg>`
  },
  {
    id: "boss",
    name: "BOSS",
    website: "https://www.boss.info",
    brandColor: "bg-black",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <rect x="10" y="8" width="80" height="24" fill="white" stroke="white"/>
      <text x="50" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="black">BOSS</text>
    </svg>`
  },
  {
    id: "roots",
    name: "Roots",
    website: "https://www.roots.com",
    brandColor: "bg-green-700",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M20 25 Q30 15 40 25 Q30 35 20 25" fill="white"/>
      <text x="65" y="18" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">Roots</text>
      <text x="65" y="30" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="white">CANADA</text>
    </svg>`
  },
  {
    id: "rabanne",
    name: "Rabanne",
    website: "https://www.rabanne.com",
    brandColor: "bg-purple-700",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <rect x="15" y="15" width="70" height="10" fill="white"/>
      <text x="50" y="26" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="purple">RABANNE</text>
    </svg>`
  },
  {
    id: "mas",
    name: "Mas+",
    website: "https://www.masplus.com",
    brandColor: "bg-orange-500",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <circle cx="35" cy="20" r="8" fill="white"/>
      <text x="35" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#ea580c">+</text>
      <text x="65" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">Mas+</text>
    </svg>`
  },
  {
    id: "hennessy",
    name: "Hennessy",
    website: "https://www.hennessy.com",
    brandColor: "bg-amber-700",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <ellipse cx="25" cy="20" rx="12" ry="15" fill="white"/>
      <text x="25" y="25" font-family="serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#d97706">H</text>
      <text x="65" y="18" font-family="serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">HENNESSY</text>
      <text x="65" y="30" font-family="serif" font-size="8" text-anchor="middle" fill="white">COGNAC</text>
    </svg>`
  },
  {
    id: "rado",
    name: "Rado",
    website: "https://www.rado.com",
    brandColor: "bg-gray-800",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <rect x="15" y="12" width="70" height="16" fill="white" rx="8"/>
      <text x="50" y="26" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="black">RADO</text>
    </svg>`
  },
  {
    id: "sutton",
    name: "Sutton Place Hotel",
    website: "https://www.suttonplace.com",
    brandColor: "bg-indigo-800",
    textColor: "text-white",
    logoSvg: `<svg viewBox="0 0 100 40" className="w-full h-full">
      <rect x="10" y="8" width="80" height="6" fill="white"/>
      <text x="50" y="20" font-family="serif" font-size="9" font-weight="bold" text-anchor="middle" fill="white">SUTTON PLACE</text>
      <text x="50" y="32" font-family="serif" font-size="8" text-anchor="middle" fill="white">HOTEL TORONTO</text>
    </svg>`
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
          {/* Page Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Our Sponsors
            </h2>
            <p className="text-gray-600">
              Thank you to our incredible sponsors who make the GLORY Sports Summit possible
            </p>
          </div>

          {/* Main Sponsor - GE (1.5x larger) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Title Sponsor</h3>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] w-full h-32"
              onClick={() => handleSponsorClick(sponsors[0].website)}
            >
              <CardContent className={`${sponsors[0].brandColor} ${sponsors[0].textColor} h-full flex items-center justify-center rounded-lg px-6 py-4`}>
                <div className="w-64 h-20" dangerouslySetInnerHTML={{ __html: sponsors[0].logoSvg }} />
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
                  <CardContent className={`${sponsor.brandColor} ${sponsor.textColor} h-full flex items-center justify-between rounded-lg px-6 py-4`}>
                    <div className="w-24 h-12" dangerouslySetInnerHTML={{ __html: sponsor.logoSvg }} />
                    <h4 className="text-lg font-semibold text-center flex-1 ml-4">{sponsor.name}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 text-center">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Thank You to Our Sponsors
                </h3>
                <p className="text-gray-600">
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