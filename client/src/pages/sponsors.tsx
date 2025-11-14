import { Star, Building2, Crown, Medal, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver';
  website?: string;
}

const sponsors: Sponsor[] = [
  { id: '1', name: 'TechCorp Global', tier: 'platinum' },
  { id: '2', name: 'InnovateLabs', tier: 'platinum' },
  { id: '3', name: 'Future Ventures', tier: 'platinum' },
  { id: '4', name: 'Digital Solutions Inc.', tier: 'gold' },
  { id: '5', name: 'Creative Agency Co.', tier: 'gold' },
  { id: '6', name: 'MediaWorks', tier: 'gold' },
  { id: '7', name: 'StartUp Hub', tier: 'silver' },
  { id: '8', name: 'Design Studio', tier: 'silver' },
  { id: '9', name: 'Brand Partners', tier: 'silver' },
  { id: '10', name: 'Marketing Pros', tier: 'silver' },
];

const platinumSponsors = sponsors.filter(s => s.tier === 'platinum');
const goldSponsors = sponsors.filter(s => s.tier === 'gold');
const silverSponsors = sponsors.filter(s => s.tier === 'silver');

export default function Sponsors() {
  const handleViewSponsor = (sponsorId: string) => {
    // TODO: Implement sponsor detail view
    console.log('View sponsor:', sponsorId);
  };

  const handleContactUs = () => {
    // TODO: Implement contact form or email
    window.location.href = 'mailto:sponsors@glory.media?subject=Become a Sponsor';
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Crown className="w-5 h-5 text-white" />;
      case 'gold':
        return <Medal className="w-5 h-5 text-white" />;
      case 'silver':
        return <Star className="w-5 h-5 text-white" />;
      default:
        return <Star className="w-5 h-5 text-white" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-purple-500 to-purple-600';
      case 'gold':
        return 'from-orange-400 to-pink-500';
      case 'silver':
        return 'from-teal-400 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'Platinum Sponsors';
      case 'gold':
        return 'Gold Sponsors';
      case 'silver':
        return 'Silver Sponsors';
      default:
        return 'Sponsors';
    }
  };

  const renderSponsorSection = (tier: 'platinum' | 'gold' | 'silver', sponsorList: Sponsor[]) => {
    if (sponsorList.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <div className={`w-10 h-10 bg-gradient-to-br ${getTierColor(tier)} rounded-full flex items-center justify-center shadow-lg`}>
            {getTierIcon(tier)}
          </div>
          <h3 className="font-semibold text-white">{getTierLabel(tier)}</h3>
        </div>

        {sponsorList.map((sponsor) => (
          <Card key={sponsor.id} className="bg-white shadow-lg" data-testid={`card-sponsor-${sponsor.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getTierColor(tier)} rounded-2xl flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900" data-testid={`text-sponsor-name-${sponsor.id}`}>
                      {sponsor.name}
                    </p>
                    <p className="text-sm text-gray-600" data-testid={`text-sponsor-tier-${sponsor.id}`}>
                      {getTierLabel(tier)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleViewSponsor(sponsor.id)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold"
                  data-testid={`button-view-${sponsor.id}`}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
        <div className="space-y-6">
          {/* Platinum Sponsors */}
          {renderSponsorSection('platinum', platinumSponsors)}

          {/* Gold Sponsors */}
          {renderSponsorSection('gold', goldSponsors)}

          {/* Silver Sponsors */}
          {renderSponsorSection('silver', silverSponsors)}

          {/* Become a Sponsor Card */}
          <Card className="bg-white shadow-lg mt-6" data-testid="card-become-sponsor">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Become a Sponsor</h2>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                Support women leaders and gain visibility with our community
              </p>
              <Button
                onClick={handleContactUs}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                data-testid="button-contact-us"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
