'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Affiliate, AffiliateConversion, AffiliatePayout } from '@/types/database'

const ease = [0.25, 0.46, 0.45, 0.94] as const
const easeArr = ease as unknown as [number, number, number, number]

const TIERS = [
  { key: 'bronze', rate: 10, min: 0, max: 10, color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)' },
  { key: 'silver', rate: 15, min: 11, max: 50, color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' },
  { key: 'gold', rate: 20, min: 51, max: 100, color: 'var(--brand)', gradient: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' },
  { key: 'diamond', rate: 25, min: 101, max: Infinity, color: '#B9F2FF', gradient: 'linear-gradient(135deg, #B9F2FF, #7EC8E3)' },
] as const

const CHANNELS = ['instagram', 'youtube', 'tiktok', 'blog', 'email', 'podcast', 'facebook', 'other'] as const

function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const prefix = 'SOS'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${code}-${userId.slice(0, 4).toUpperCase()}`
}

// ═══════════════════════════════════════════════════════
// Landing View — Pour les non-affiliés
// ═══════════════════════════════════════════════════════
function AffiliateLanding({ onApply }: { onApply: () => void }) {
  const { t } = useTranslation()

  const benefits = [
    { icon: '↻', title: t('affiliate.benefit1_title'), desc: t('affiliate.benefit1_desc'), accent: 'var(--success)' },
    { icon: '◎', title: t('affiliate.benefit2_title'), desc: t('affiliate.benefit2_desc'), accent: 'var(--accent-blue)' },
    { icon: '▣', title: t('affiliate.benefit3_title'), desc: t('affiliate.benefit3_desc'), accent: 'var(--warning)' },
    { icon: '◈', title: t('affiliate.benefit4_title'), desc: t('affiliate.benefit4_desc'), accent: 'var(--brand)' },
    { icon: '☎', title: t('affiliate.benefit5_title'), desc: t('affiliate.benefit5_desc'), accent: 'var(--accent-purple)' },
    { icon: '♡', title: t('affiliate.benefit6_title'), desc: t('affiliate.benefit6_desc'), accent: '#FD79A8' },
  ]

  const faqs = [
    { q: t('affiliate.faq1_q'), a: t('affiliate.faq1_a') },
    { q: t('affiliate.faq2_q'), a: t('affiliate.faq2_a') },
    { q: t('affiliate.faq3_q'), a: t('affiliate.faq3_a') },
    { q: t('affiliate.faq4_q'), a: t('affiliate.faq4_a') },
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeArr }}
        className="text-center relative"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%)' }}
        />
        <span
          className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-6"
          style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--brand)', border: '1px solid rgba(212, 175, 55, 0.15)' }}
        >
          {t('affiliate.hero_badge')}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-[var(--text-primary)]">
          {t('affiliate.hero_title')}{' '}
          <span className="text-shimmer">{t('affiliate.hero_title_highlight')}</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-[var(--text-secondary)]">
          {t('affiliate.hero_desc')}
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onApply}
          className="mt-8 px-8 py-3.5 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
            color: '#09090b',
            boxShadow: '0 4px 24px rgba(212, 175, 55, 0.25)',
          }}
        >
          {t('affiliate.apply_cta')}
        </motion.button>
      </motion.div>

      {/* ── How it Works ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: easeArr }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-6 text-center text-[var(--text-muted)]">
          {t('affiliate.how_it_works')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { num: '01', title: t('affiliate.step1_title'), desc: t('affiliate.step1_desc'), accent: 'var(--success)' },
            { num: '02', title: t('affiliate.step2_title'), desc: t('affiliate.step2_desc'), accent: 'var(--accent-blue)' },
            { num: '03', title: t('affiliate.step3_title'), desc: t('affiliate.step3_desc'), accent: 'var(--brand)' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: easeArr }}
              className="glass glass-hover p-6 text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${step.accent}, transparent)`, opacity: 0.4 }} />
              <span className="font-display text-3xl font-semibold block mb-3" style={{ color: step.accent, opacity: 0.2 }}>{step.num}</span>
              <h3 className="font-semibold text-[15px] mb-2" style={{ color: step.accent }}>{step.title}</h3>
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Commission Tiers ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: easeArr }}
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t('affiliate.tiers_title')}
          </h2>
          <p className="mt-2 text-[14px] max-w-xl mx-auto text-[var(--text-secondary)]">
            {t('affiliate.tiers_subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease: easeArr }}
              className="glass glass-hover p-6 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${tier.color}08, transparent 70%)` }}
              />
              {/* Tier icon */}
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${tier.color}15` }}
              >
                <span className="font-display text-xl font-bold" style={{ color: tier.color }}>
                  {tier.rate}%
                </span>
              </div>
              <h3 className="font-semibold text-[15px] mb-1" style={{ color: tier.color }}>
                {t(`affiliate.tier_${tier.key}`)}
              </h3>
              <p className="text-[12px] mb-3 text-[var(--text-muted)]">
                {t(`affiliate.tier_${tier.key}_range`)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                {t('affiliate.commission')}
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">
                {t('affiliate.recurring')}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Benefits ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: easeArr }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-6 text-center text-[var(--text-muted)]">
          {t('affiliate.benefits_title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.4, ease: easeArr }}
              className="glass glass-hover p-5 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 text-lg"
                style={{ background: `${b.accent}12`, color: b.accent }}
              >
                {b.icon}
              </div>
              <h3 className="font-semibold text-[14px] mb-1 text-[var(--text-primary)]">{b.title}</h3>
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: easeArr }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-center mb-6 text-[var(--text-primary)]">
          {t('affiliate.faq_title')}
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass overflow-hidden transition-all duration-300"
              style={{ borderColor: openFaq === i ? 'rgba(212, 175, 55, 0.15)' : undefined }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="font-semibold text-[14px] pr-4 text-[var(--text-primary)]">{faq.q}</span>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-muted)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeArr }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Final CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5, ease: easeArr }}
        className="glass p-8 sm:p-10 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.06), rgba(255, 255, 255, 0.02))', borderColor: 'rgba(212, 175, 55, 0.12)' }}
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent 70%)' }}
        />
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight relative text-[var(--text-primary)]">
          {t('affiliate.hero_title')}{' '}
          <span className="text-[var(--brand)]">{t('affiliate.hero_title_highlight')}</span>
        </h2>
        <p className="mt-3 text-[14px] max-w-lg mx-auto relative text-[var(--text-secondary)]">
          {t('affiliate.hero_desc')}
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onApply}
          className="mt-6 px-8 py-3.5 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-300 relative"
          style={{
            background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
            color: '#09090b',
            boxShadow: '0 4px 24px rgba(212, 175, 55, 0.25)',
          }}
        >
          {t('affiliate.apply_cta')}
        </motion.button>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Application Form
// ═══════════════════════════════════════════════════════
function AffiliateApplicationForm({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const { t } = useTranslation()
  const [motivation, setMotivation] = useState('')
  const [audienceSize, setAudienceSize] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [website, setWebsite] = useState('')
  const [socialLink, setSocialLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleChannel(ch: string) {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!motivation.trim() || motivation.trim().length < 20) return
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const referralCode = generateReferralCode(userId)

      const { error: insertError } = await supabase.from('affiliates').insert({
        user_id: userId,
        referral_code: referralCode,
        motivation: motivation.trim(),
        audience_size: audienceSize.trim() || null,
        promotion_channels: channels,
        social_links: socialLink ? { main: socialLink } : {},
        website_url: website.trim() || null,
        status: 'pending',
      })

      if (insertError) throw insertError
      onSuccess()
    } catch {
      setError(t('affiliate.form_error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeArr }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t('affiliate.form_title')}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
          {t('affiliate.form_subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 space-y-6">
        {/* Motivation */}
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
            {t('affiliate.form_motivation')} <span className="text-[var(--danger)]">*</span>
          </label>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder={t('affiliate.form_motivation_placeholder')}
            rows={5}
            required
            minLength={20}
            className="w-full rounded-xl px-4 py-3 text-[14px] resize-none outline-none transition-all duration-200 placeholder:opacity-40"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {motivation.length}/20 min
          </p>
        </div>

        {/* Audience size */}
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
            {t('affiliate.form_audience')}
          </label>
          <input
            type="text"
            value={audienceSize}
            onChange={(e) => setAudienceSize(e.target.value)}
            placeholder={t('affiliate.form_audience_placeholder')}
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 placeholder:opacity-40"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Promotion Channels */}
        <div>
          <label className="block text-[13px] font-semibold mb-3 text-[var(--text-primary)]">
            {t('affiliate.form_channels')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: channels.includes(ch) ? 'rgba(212, 175, 55, 0.12)' : 'var(--surface-card)',
                  border: `1px solid ${channels.includes(ch) ? 'rgba(212, 175, 55, 0.3)' : 'var(--border)'}`,
                  color: channels.includes(ch) ? 'var(--brand)' : 'var(--text-secondary)',
                }}
              >
                {t(`affiliate.form_channel_${ch}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Social link */}
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
            {t('affiliate.form_social')}
          </label>
          <input
            type="url"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            placeholder={t('affiliate.form_social_placeholder')}
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 placeholder:opacity-40"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
            {t('affiliate.form_website')}
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder={t('affiliate.form_website_placeholder')}
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 placeholder:opacity-40"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {error && (
          <p className="text-[13px] text-center text-[var(--danger)]">{error}</p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting || motivation.trim().length < 20}
          className="w-full py-3.5 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
            color: '#09090b',
            boxShadow: '0 4px 24px rgba(212, 175, 55, 0.25)',
          }}
        >
          {submitting ? t('affiliate.form_submitting') : t('affiliate.form_submit')}
        </motion.button>
      </form>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// Pending Status View
// ═══════════════════════════════════════════════════════
function AffiliatePending() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeArr }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <div
        className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6"
        style={{ background: 'rgba(212, 175, 55, 0.1)' }}
      >
        <svg className="w-10 h-10 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">
        {t('affiliate.status_pending')}
      </h2>
      <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
        {t('affiliate.pending_message')}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// Rejected Status View
// ═══════════════════════════════════════════════════════
function AffiliateRejected({ reason }: { reason: string | null }) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeArr }}
      className="max-w-lg mx-auto text-center py-16"
    >
      <div
        className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6"
        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
      >
        <svg className="w-10 h-10 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">
        {t('affiliate.status_rejected')}
      </h2>
      <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
        {t('affiliate.rejected_message')}
      </p>
      {reason && (
        <div className="glass mt-6 p-4 text-left">
          <p className="text-[13px] text-[var(--text-secondary)]">{reason}</p>
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// Affiliate Dashboard (Approved)
// ═══════════════════════════════════════════════════════
function WithdrawalModal({ affiliate, onClose, onSuccess }: { affiliate: Affiliate; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState(affiliate.pending_earnings >= 50 ? Math.floor(affiliate.pending_earnings) : 50)
  const [method, setMethod] = useState<'bank_transfer' | 'paypal'>('bank_transfer')
  const [iban, setIban] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount < 50 || amount > affiliate.pending_earnings) return
    if (method === 'bank_transfer' && !iban.trim()) { setError('IBAN requis'); return }
    if (method === 'paypal' && !paypalEmail.trim()) { setError('Email PayPal requis'); return }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payment_method: method,
          iban: method === 'bank_transfer' ? iban.trim() : null,
          paypal_email: method === 'paypal' ? paypalEmail.trim() : null,
        }),
      })
      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur lors de la demande')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--surface-card)] border border-[var(--border)]"
      >
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
            Demander un retrait
          </h2>
          <p className="text-[13px] mt-1 text-[var(--text-secondary)]">
            Solde disponible : <span className="font-semibold text-[var(--brand)]">{affiliate.pending_earnings.toFixed(2)}€</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Montant */}
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
              Montant (min. 50€)
            </label>
            <div className="relative">
              <input
                type="number" min={50} max={affiliate.pending_earnings} step={0.01}
                value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none pr-10"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[var(--brand)]">€</span>
            </div>
          </div>

          {/* Méthode */}
          <div>
            <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
              Mode de paiement
            </label>
            <div className="flex gap-3">
              {([
                { key: 'bank_transfer' as const, label: 'Virement bancaire', icon: '🏦' },
                { key: 'paypal' as const, label: 'PayPal', icon: '💳' },
              ]).map(m => (
                <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                  className="flex-1 py-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all"
                  style={{
                    background: method === m.key ? 'rgba(201,169,97,0.1)' : 'var(--surface)',
                    border: `1px solid ${method === m.key ? 'rgba(201,169,97,0.3)' : 'var(--border)'}`,
                    color: method === m.key ? 'var(--brand)' : 'var(--text-secondary)',
                  }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* IBAN ou PayPal */}
          {method === 'bank_transfer' ? (
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
                IBAN
              </label>
              <input
                type="text" value={iban} onChange={(e) => setIban(e.target.value)}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className="w-full rounded-xl px-4 py-3 text-[14px] font-mono outline-none placeholder:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-[var(--text-primary)]">
                Email PayPal
              </label>
              <input
                type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none placeholder:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          )}

          {error && (
            <p className="text-[13px] text-center text-[var(--danger)]">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={submitting || amount < 50 || amount > affiliate.pending_earnings}
              className="flex-1 py-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#09090b' }}>
              {submitting ? 'Envoi...' : `Retirer ${amount.toFixed(2)}€`}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function AffiliateDashboard({ affiliate }: { affiliate: Affiliate }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [conversions, setConversions] = useState<AffiliateConversion[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showWithdrawal, setShowWithdrawal] = useState(false)
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false)

  const currentTier = TIERS.find(t => t.key === affiliate.current_tier) || TIERS[0]
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1]
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${affiliate.referral_code}`
    : `https://sosshine.com/signup?ref=${affiliate.referral_code}`

  const conversionRate = affiliate.total_clicks > 0
    ? ((affiliate.total_referrals / affiliate.total_clicks) * 100).toFixed(1)
    : '0.0'

  const loadAffiliateData = useCallback(async () => {
    const supabase = createClient()
    const [convRes, payRes] = await Promise.all([
      supabase.from('affiliate_conversions').select('*').eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('affiliate_payouts').select('*').eq('affiliate_id', affiliate.id).order('created_at', { ascending: false }).limit(10),
    ])
    if (convRes.data) setConversions(convRes.data as AffiliateConversion[])
    if (payRes.data) setPayouts(payRes.data as AffiliatePayout[])
    setLoadingData(false)
  }, [affiliate.id])

  useEffect(() => {
    loadAffiliateData()
  }, [loadAffiliateData])

  function copyLink() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const progressToNext = nextTier
    ? Math.min(100, ((affiliate.total_referrals - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeArr }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: `${currentTier.color}15`, color: currentTier.color, border: `1px solid ${currentTier.color}25` }}
          >
            {t(`affiliate.tier_${currentTier.key}`)}
          </span>
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            {currentTier.rate}% {t('affiliate.commission')}
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t('affiliate.dashboard_title')}
        </h1>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: easeArr }}
        className="glass p-5 sm:p-6"
        style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}
      >
        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3 text-[var(--text-muted)]">
          {t('affiliate.your_link')}
        </p>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 rounded-xl px-4 py-3 text-[13px] font-mono truncate select-all"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--brand)' }}
          >
            {referralUrl}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyLink}
            className="px-5 py-3 rounded-xl font-semibold text-[13px] cursor-pointer whitespace-nowrap transition-all duration-200"
            style={{
              background: copied ? 'rgba(85, 239, 196, 0.15)' : 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
              color: copied ? 'var(--success)' : '#09090b',
              border: copied ? '1px solid rgba(85, 239, 196, 0.3)' : 'none',
            }}
          >
            {copied ? t('affiliate.link_copied') : t('affiliate.copy_link')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: easeArr }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4 text-[var(--text-muted)]">
          {t('affiliate.stats_title')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: t('affiliate.stat_clicks'), value: affiliate.total_clicks.toLocaleString(), accent: 'var(--accent-blue)' },
            { label: t('affiliate.stat_conversions'), value: affiliate.total_referrals.toLocaleString(), accent: 'var(--success)' },
            { label: t('affiliate.stat_rate'), value: `${conversionRate}%`, accent: 'var(--accent-purple)' },
            { label: t('affiliate.stat_earnings'), value: `${affiliate.total_earnings.toFixed(2)}€`, accent: 'var(--brand)' },
            { label: t('affiliate.stat_pending'), value: `${affiliate.pending_earnings.toFixed(2)}€`, accent: 'var(--warning)' },
            { label: t('affiliate.stat_paid'), value: `${affiliate.paid_earnings.toFixed(2)}€`, accent: 'var(--success)' },
          ].map((stat, i) => (
            <div key={i} className="glass p-4 text-center">
              <p className="font-display text-xl sm:text-2xl font-semibold" style={{ color: stat.accent }}>
                {stat.value}
              </p>
              <p className="text-[11px] mt-1 text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tier Progress */}
      {nextTier && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: easeArr }}
          className="glass p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold" style={{ color: currentTier.color }}>
                {t(`affiliate.tier_${currentTier.key}`)}
              </span>
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <span className="text-[13px] font-semibold" style={{ color: nextTier.color }}>
                {t(`affiliate.tier_${nextTier.key}`)} ({nextTier.rate}%)
              </span>
            </div>
            <span className="text-[12px] text-[var(--text-muted)]">
              {affiliate.total_referrals}/{nextTier.min} filleuls
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--surface-card)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: easeArr }}
              className="h-full rounded-full"
              style={{ background: currentTier.gradient }}
            />
          </div>
        </motion.div>
      )}

      {/* Recent Conversions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: easeArr }}
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4 text-[var(--text-muted)]">
          {t('affiliate.recent_conversions')}
        </h2>
        {loadingData ? (
          <div className="glass p-8 text-center">
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : conversions.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-[14px] font-semibold mb-1 text-[var(--text-primary)]">
              {t('affiliate.no_conversions')}
            </p>
            <p className="text-[13px] text-[var(--text-muted)]">
              {t('affiliate.no_conversions_desc')}
            </p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Type</th>
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Plan</th>
                    <th className="px-5 py-3 text-right font-semibold text-[var(--text-muted)]">Commission</th>
                    <th className="px-5 py-3 text-right font-semibold text-[var(--text-muted)]">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conv) => (
                    <tr key={conv.id} className="border-b border-[var(--border)]">
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {new Date(conv.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 capitalize text-[var(--text-secondary)]">
                        {conv.conversion_type}
                      </td>
                      <td className="px-5 py-3 capitalize text-[var(--text-secondary)]">
                        {conv.plan || '-'}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[var(--brand)]">
                        {conv.commission_amount.toFixed(2)}€
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            background: conv.status === 'confirmed' ? 'rgba(85, 239, 196, 0.12)' :
                              conv.status === 'paid' ? 'rgba(212, 175, 55, 0.12)' :
                              conv.status === 'cancelled' ? 'rgba(239, 68, 68, 0.12)' :
                              'rgba(255, 255, 255, 0.06)',
                            color: conv.status === 'confirmed' ? 'var(--success)' :
                              conv.status === 'paid' ? 'var(--brand)' :
                              conv.status === 'cancelled' ? 'var(--danger)' :
                              'var(--text-muted)',
                          }}
                        >
                          {conv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Withdrawal Success Toast */}
      <AnimatePresence>
        {withdrawalSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-[14px] font-semibold"
            style={{ background: 'rgba(85,239,196,0.15)', color: 'var(--success)', border: '1px solid rgba(85,239,196,0.3)', backdropFilter: 'blur(12px)' }}
          >
            Demande de retrait envoyee avec succes !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawal && (
          <WithdrawalModal
            affiliate={affiliate}
            onClose={() => setShowWithdrawal(false)}
            onSuccess={() => {
              setWithdrawalSuccess(true)
              setTimeout(() => setWithdrawalSuccess(false), 4000)
              loadAffiliateData()
            }}
          />
        )}
      </AnimatePresence>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: easeArr }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {t('affiliate.payout_history')}
          </h2>
          {affiliate.pending_earnings >= 50 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowWithdrawal(true)}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                color: 'var(--brand)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              {t('affiliate.request_payout')}
            </motion.button>
          )}
        </div>
        {!loadingData && payouts.length === 0 ? (
          <div className="glass p-6 text-center">
            <p className="text-[13px] text-[var(--text-muted)]">
              {t('affiliate.no_payouts')}
            </p>
            {affiliate.pending_earnings < 50 && (
              <p className="text-[12px] mt-1 text-[var(--text-muted)]">
                {t('affiliate.min_payout')}
              </p>
            )}
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Montant</th>
                    <th className="px-5 py-3 text-left font-semibold text-[var(--text-muted)]">Moyen</th>
                    <th className="px-5 py-3 text-right font-semibold text-[var(--text-muted)]">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)]">
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {new Date(p.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[var(--brand)]">
                        {p.amount.toFixed(2)}€
                      </td>
                      <td className="px-5 py-3 capitalize text-[var(--text-secondary)]">
                        {p.payment_method.replace('_', ' ')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            background: p.status === 'completed' ? 'rgba(85, 239, 196, 0.12)' :
                              p.status === 'failed' ? 'rgba(239, 68, 68, 0.12)' :
                              'rgba(255, 255, 255, 0.06)',
                            color: p.status === 'completed' ? 'var(--success)' :
                              p.status === 'failed' ? 'var(--danger)' :
                              'var(--text-muted)',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Contact Support */}
      <SupportContact />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Support Contact — Contacter les fondateurs
// ═══════════════════════════════════════════════════════
function SupportContact() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase.from('courrier_anonyme').insert({
        user_id: user?.id || null,
        category: 'autre' as const,
        subject: 'Support Affiliation',
        content: message.trim(),
      })

      if (insertError) throw insertError

      setSent(true)
      setMessage('')
      setTimeout(() => setSent(false), 5000)
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    }
    setSending(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: easeArr }}
    >
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.15)' }}>
            <svg className="w-4 h-4 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Contacter le support</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Une question sur votre programme ? Julia, William & Thomas vous répondent personnellement.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-xl px-4 py-3 text-sm text-center" style={{ background: 'rgba(85,239,196,0.08)', color: 'var(--success)', border: '1px solid rgba(85,239,196,0.15)' }}>
            Message envoyé ! L&apos;équipe fondatrice vous répondra dans les plus brefs délais.
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message pour l'équipe fondatrice..."
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            {error && (
              <p className="text-xs text-[var(--danger)]">{error}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[var(--text-muted)]">{message.length}/2000</p>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}
              >
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════
export default function AffiliationPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [view, setView] = useState<'landing' | 'form' | 'pending' | 'rejected' | 'dashboard'>('landing')

  const loadAffiliate = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)

    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (data) {
      const aff = data as Affiliate
      setAffiliate(aff)
      switch (aff.status) {
        case 'pending': setView('pending'); break
        case 'approved': setView('dashboard'); break
        case 'rejected': setView('rejected'); break
        case 'suspended': setView('rejected'); break
        default: setView('landing')
      }
    } else {
      setView('landing')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAffiliate()
  }, [loadAffiliate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }}>
            <div className="w-5 h-5 border-2 border-[var(--surface)] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-[var(--text-muted)]">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <motion.div key="landing" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <AffiliateLanding onApply={() => setView('form')} />
        </motion.div>
      )}
      {view === 'form' && userId && (
        <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <AffiliateApplicationForm userId={userId} onSuccess={() => { setView('pending') }} />
        </motion.div>
      )}
      {view === 'pending' && (
        <motion.div key="pending" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <AffiliatePending />
        </motion.div>
      )}
      {view === 'rejected' && (
        <motion.div key="rejected" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <AffiliateRejected reason={affiliate?.rejection_reason || null} />
        </motion.div>
      )}
      {view === 'dashboard' && affiliate && (
        <motion.div key="dashboard" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <AffiliateDashboard affiliate={affiliate} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
