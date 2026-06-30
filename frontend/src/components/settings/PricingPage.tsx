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
  ExternalLink,
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
      iconColor: 'text-slate-400 bg-slate-900',
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
      iconColor: 'text-indigo-400 bg-indigo-500/10',
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
      iconColor: 'text-purple-400 bg-purple-500/10',
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
      iconColor: 'text-emerald-400 bg-emerald-500/10',
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
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-slate-800">
          Flexible Pricing Tiers
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Get recruiter-grade feedback on your CV and optimize your application pipeline.
        </p>

        {/* Annual discount toggle */}
        <div className="inline-flex items-center gap-3 p-1 background bg-slate-100/80 border border-slate-200/60 rounded-full">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Annual
            <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Save up to 34%
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl p-4 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
              className={`bg-white/60 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all group ${
                tier.popular 
                  ? 'ring-2 ring-indigo-650/85 border-indigo-650/40' 
                  : 'ring-1 ring-gray-200/80 border-transparent'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tier.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isActive && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                        Current Tier
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{tier.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{tier.tagline}</p>
                  </div>
                </div>

                {/* Pricing info */}
                <div className="border-t border-slate-200/60 pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-display text-slate-800">
                      ${price}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-xs text-slate-400 font-bold">{periodLabel}</span>
                    )}
                  </div>
                  {billingPeriod === 'annual' && tier.monthlyPrice > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Billed annually (equals ${(price / 12).toFixed(2)}/mo)
                    </p>
                  )}
                </div>

                {/* Features check list */}
                <div className="border-t border-slate-200/60 pt-4 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    What's Included
                  </span>
                  
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 text-[11px] text-slate-650 font-semibold leading-relaxed">
                        <Check className="h-3.5 w-3.5 text-indigo-650 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-200/60">
                {tier.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-full border border-slate-200 bg-slate-55/60 text-xs font-bold text-slate-400 text-center"
                  >
                    {isCurrentTier ? 'Active Free Account' : 'Standard Access'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionAction(tier.id)}
                    disabled={loadingTier !== null}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrentTier
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : tier.popular
                        ? 'bg-indigo-650 hover:bg-indigo-550 text-white shadow-md shadow-indigo-650/15'
                        : 'border-2 border-indigo-200 text-indigo-650 hover:bg-indigo-50/30'
                    }`}
                  >
                    {loadingTier === tier.id ? (
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrentTier ? (
                      <>
                        <CreditCard className="h-3.5 w-3.5" />
                        Manage Billing
                      </>
                    ) : (
                      <>
                        Upgrade Tier
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe and Security assurance widget */}
      <div className="bg-white/60 backdrop-blur-md ring-1 ring-gray-200/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-805">Secure Billing by Stripe</h4>
            <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Your payment credentials are processed securely and never saved on our databases.</p>
          </div>
        </div>
        
        <a 
          href="https://stripe.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-xs font-bold text-slate-550 hover:text-slate-800 flex items-center gap-1.5 border border-slate-205 px-4.5 py-2 rounded-full hover:bg-white transition-all shadow-sm"
        >
          stripe.com
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};
