import React, { useState } from 'react';
import { useAppSelector } from '../../store';
import axios from 'axios';
import { 
  Check, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  Shield, 
  CreditCard,
  ChevronRight
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userTier = user?.subscription_tier || 'free';
  const userStatus = user?.subscription_status || 'inactive';

  const handleSubscriptionAction = async (tier: string) => {
    setLoadingTier(tier);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (tier === userTier && userTier !== 'free') {
        // Redirect to customer portal to manage subscription
        const response = await axios.post(
          '/api/v1/monetization/portal',
          { return_url: window.location.href },
          { headers }
        );
        if (response.data?.url) {
          window.location.href = response.data.url;
        }
      } else {
        // Upgrade to new subscription tier
        const response = await axios.post(
          '/api/v1/monetization/checkout',
          {
            tier,
            success_url: `${window.location.origin}/?tab=settings&payment=success`,
            cancel_url: `${window.location.origin}/?tab=settings&payment=cancel`
          },
          { headers }
        );
        if (response.data?.url) {
          window.location.href = response.data.url;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Billing portal failed to initialize. Please check your credentials.'
      );
    } finally {
      setLoadingTier(null);
    }
  };

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free Starter',
      tagline: 'Basic CV checker tools.',
      monthlyPrice: 0,
      annualPrice: 0,
      icon: HelpCircle,
      iconColor: 'text-slate-600',
      features: [
        'Resume upload and basic text parsing',
        'Basic ATS compatibility checks',
        'Standard keyword matching count',
        'History storage limited to 1 version',
        '1 scan report per calendar month',
      ],
      premium: false
    },
    {
      id: 'pro',
      name: 'Professional',
      tagline: 'Unlock semantic fit scans.',
      monthlyPrice: 4.99,
      annualPrice: 39,
      icon: Zap,
      iconColor: 'text-indigo-500',
      features: [
        'Semantic Job Fit Scoring (concept match)',
        'Bullet Quality analysis & suggestions',
        'Up to 3 Multi-JD comparisons',
        'Save up to 2 resume revisions',
        '5 scan reports per month',
      ],
      premium: true
    },
    {
      id: 'pro_plus',
      name: 'Pro Plus',
      tagline: 'AI-Powered bullet rewriter.',
      monthlyPrice: 14.99,
      annualPrice: 119,
      icon: Sparkles,
      iconColor: 'text-purple-500',
      features: [
        'Everything in Professional tier',
        'AI Bullet Rewriter (10 rewrites/mo)',
        'Mock Interview Prep session questions',
        'Up to 5 Multi-JD comparisons',
        'Unlimited scans & revisions history',
        'Premium PDF report exports',
      ],
      premium: true,
      popular: true
    },
    {
      id: 'team',
      name: 'Team Recruiter',
      tagline: 'B2B sourcing & aggregate tools.',
      monthlyPrice: 49.99,
      annualPrice: 399,
      icon: Shield,
      iconColor: 'text-emerald-500',
      features: [
        'Everything in Pro Plus tier',
        'Bulk uploads (10-50 resumes simultaneously)',
        'Recruiter dashboard & analytics charts',
        'Custom scoring weight allocations',
        'Developer API integration access',
        'White-label portal embedding options',
      ],
      premium: true
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto skeuo-panel p-8">
        <h2 className="text-2xl font-bold font-display text-slate-900">
          Flexible Pricing Tiers
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Get recruiter-grade feedback on your CV and optimize your application pipeline.
        </p>

        {/* Annual discount toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 skeuo-pressed rounded-full mt-4">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'skeuo-raised text-slate-900'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === 'annual'
                ? 'skeuo-raised text-slate-900'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Annual
            <span className="skeuo-pressed text-emerald-600 text-[10px] px-2.5 py-1 rounded-full font-bold ml-1">
              Save up to 34%
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl p-4 text-xs font-bold text-center skeuo-pressed">
          {error}
        </div>
      )}

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch pt-4">
        {pricingTiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentTier = userTier === tier.id;
          const isActive = isCurrentTier && (userStatus === 'active' || tier.id === 'free');
          
          // Cost math
          const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
          const periodLabel = billingPeriod === 'monthly' ? '/mo' : '/yr';

          return (
            <div 
              key={tier.id}
              className={`rounded-[32px] p-7 flex flex-col justify-between relative transition-all duration-300 ${
                tier.popular 
                  ? 'skeuo-raised border-2 border-indigo-200/50' 
                  : 'skeuo-raised'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 skeuo-raised-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`h-12 w-12 rounded-2xl skeuo-pressed flex items-center justify-center ${tier.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {isActive && (
                      <span className="skeuo-pressed text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full">
                        Current Tier
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{tier.name}</h3>
                    <p className="text-[11px] text-slate-600 mt-1 font-bold">{tier.tagline}</p>
                  </div>
                </div>

                {/* Pricing info */}
                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-display text-slate-900">
                      ${price}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-xs text-slate-600 font-bold">{periodLabel}</span>
                    )}
                  </div>
                  {billingPeriod === 'annual' && tier.monthlyPrice > 0 && (
                    <p className="text-[10px] text-slate-500 mt-1.5 font-bold">
                      Billed annually (equals ${(price / 12).toFixed(2)}/mo)
                    </p>
                  )}
                </div>

                {/* Features check list */}
                <div className="pt-2 space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-1">
                    What's Included
                  </span>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-3 text-[11px] text-slate-700 font-bold leading-relaxed">
                        <div className="mt-0.5 skeuo-pressed p-0.5 rounded-full">
                          <Check className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                {tier.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl skeuo-pressed text-xs font-bold text-slate-500 text-center"
                  >
                    {isCurrentTier ? 'Active Free Account' : 'Standard Access'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionAction(tier.id)}
                    disabled={loadingTier !== null}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrentTier
                        ? 'skeuo-pressed text-slate-700'
                        : tier.popular
                        ? 'skeuo-raised-accent text-white active:skeuo-pressed'
                        : 'skeuo-raised text-indigo-600 active:skeuo-pressed'
                    }`}
                  >
                    {loadingTier === tier.id ? (
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrentTier ? (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Manage Billing
                      </>
                    ) : (
                      <>
                        Upgrade Tier
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
