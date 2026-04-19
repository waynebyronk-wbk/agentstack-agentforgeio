import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy, CheckCircle, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SubscriptionManagement() {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referrals] = useState([
    { name: "John Smith", signupDate: "2026-04-15", reward: 50 },
    { name: "Sarah Johnson", signupDate: "2026-04-10", reward: 50 },
  ]);

  const referralLink = "https://agentforge.io/ref/wayne-byron-kimball";
  const totalReferralRewards = referrals.reduce((sum, ref) => sum + ref.reward, 0);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleCancelSubscription = () => {
    // Call API to cancel subscription
    console.log("Cancelling subscription...");
    setShowCancelConfirm(false);
    // Show success message
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage your subscription and referral program</p>
        </div>

        {/* Current Subscription */}
        <Card className="border border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Pro - Monthly Plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Monthly Cost</p>
                <p className="text-3xl font-bold text-white">$99</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Next Billing Date</p>
                <p className="text-xl font-semibold text-white">May 19, 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Active and in good standing</span>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">Update Payment Method</Button>
              <Button variant="outline" className="border-slate-600">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card className="border border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Referral Program
            </CardTitle>
            <CardDescription>Earn $50 for each successful referral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Total Referrals</p>
                <p className="text-3xl font-bold text-white">{referrals.length}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Total Rewards Earned</p>
                <p className="text-3xl font-bold text-green-400">${totalReferralRewards}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Pending Rewards</p>
                <p className="text-3xl font-bold text-yellow-400">$0</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Your Referral Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
                <Button
                  onClick={copyReferralLink}
                  className={`${
                    referralCopied
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {referralCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Referral List */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Recent Referrals</p>
              {referrals.length > 0 ? (
                <div className="space-y-2">
                  {referrals.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-white">{ref.name}</p>
                        <p className="text-xs text-gray-400">
                          Signed up on {new Date(ref.signupDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-green-400">+${ref.reward}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No referrals yet. Share your link to earn rewards!</p>
              )}
            </div>

            {/* Share Tips */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-blue-400">💡 Sharing Tips</p>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Share your referral link on social media</li>
                <li>• Email your link to friends and colleagues</li>
                <li>• Include it in your email signature</li>
                <li>• Post it in relevant communities and forums</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Subscription */}
        <Card className="border border-red-500/30 bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>Cancel your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-300">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  Cancelling your subscription will immediately revoke your access to all premium
                  features. You can resubscribe anytime.
                </p>
              </div>
            </div>

            {!showCancelConfirm ? (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Cancel Subscription
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-slate-700/50 rounded-lg">
                <p className="font-semibold text-white">Are you sure you want to cancel?</p>
                <p className="text-sm text-gray-400">
                  You will lose access to all premium features immediately. Your data will be
                  retained for 30 days.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelSubscription}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Yes, Cancel Subscription
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    variant="outline"
                    className="flex-1 border-slate-600"
                  >
                    No, Keep Subscription
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
