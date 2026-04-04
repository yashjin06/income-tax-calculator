import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, User, Home, Briefcase, FileText, Activity } from 'lucide-react'

const GuidedMode = ({ data, updateData, exitGuidedMode }) => {
  const [step, setStep] = useState(0)

  const steps = [
    { id: 'intro', title: 'Welcome to TaxNova Pro', icon: <User size={24} /> },
    { id: 'personal', title: 'Personal Details', icon: <User size={24} /> },
    { id: 'salary', title: 'Employment Income', icon: <FileText size={24} /> },
    { id: 'deductions', title: 'Tax Saving Investments', icon: <Activity size={24} /> },
    { id: 'business', title: 'Business & Profession', icon: <Briefcase size={24} /> },
    { id: 'capital', title: 'Capital Gains & VDA', icon: <Activity size={24} /> },
    { id: 'other', title: 'Other Income', icon: <Home size={24} /> },
    { id: 'summary', title: 'Finish & Compute', icon: <ArrowRight size={24} /> }
  ]

  const handleChange = (section, field, value) => {
    updateData({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    })
  }

  const renderContent = () => {
    switch (steps[step].id) {
      case 'intro':
        return (
          <div className="text-center slide-up">
            <h2 className="text-2xl font-bold mb-4">Let's calculate your taxes, step-by-step.</h2>
            <p className="text-gray-500 mb-6">We will ask you a few simple questions. Your answers are processed 100% locally and offline.</p>
            <button className="btn btn-primary" onClick={() => setStep(1)}>Get Started <ArrowRight size={16}/></button>
          </div>
        )
      case 'personal':
        return (
          <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Tell us about yourself</h3>
             <div className="input-group mb-4">
                <label className="input-label">What is your Full Name?</label>
                <input type="text" className="input-field" value={data.personal?.name || ''} onChange={(e) => handleChange('personal', 'name', e.target.value)} placeholder="e.g. Rahul Sharma" />
             </div>
             <div className="input-group mb-4">
                <label className="input-label">What is your Age Category?</label>
                <select className="input-field" value={data.personal?.ageCategory || 'below60'} onChange={(e) => handleChange('personal', 'ageCategory', e.target.value)}>
                   <option value="below60">Below 60 Years</option>
                   <option value="senior">60 to 79 Years</option>
                   <option value="superSenior">80 Years & Above</option>
                </select>
             </div>
             <div className="input-group mb-4">
                <label className="input-label">Tax Regime Choice (FY 23-24 onwards)</label>
                <select className="input-field" value={data.personal?.newRegime || 'yes'} onChange={(e) => handleChange('personal', 'newRegime', e.target.value)}>
                   <option value="yes">New Tax Regime (Default, lower rates, no deductions)</option>
                   <option value="no">Old Tax Regime (Higher rates, 80C deductions allowed)</option>
                </select>
             </div>
          </div>
        )
      case 'salary':
        return (
          <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Are you a salaried employee?</h3>
             <p className="text-sm text-gray-500 mb-4">If yes, enter your total gross basic salary for the year. Standard deduction of ₹50k/75k is automatically applied.</p>
             <div className="input-group mb-4">
                <label className="input-label">Total Basic Salary (₹)</label>
                <input type="number" className="input-field" value={data.salary?.basic || ''} onChange={(e) => handleChange('salary', 'basic', parseFloat(e.target.value) || 0)} placeholder="0" />
             </div>
          </div>
        )
      case 'deductions':
        return (
          <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Tax Saving Investments (80C & 80D)</h3>
             <p className="text-sm text-gray-500 mb-4">Did you invest in LIC, PPF, ELSS Mutual Funds, or pay children's tuition fees? (Max benefit ₹1.5L usually only applies to Old Regime)</p>
             <div className="input-group mb-4">
                <label className="input-label">Total 80C Investments (₹)</label>
                <input type="number" className="input-field" value={data.deductions?.sec80c || ''} onChange={(e) => handleChange('deductions', 'sec80c', parseFloat(e.target.value) || 0)} placeholder="e.g. 150000" />
             </div>
             <p className="text-sm text-gray-500 mb-4 mt-6">Did you pay health insurance premiums for yourself or your family?</p>
             <div className="input-group mb-4">
                <label className="input-label">Health Insurance Premium (₹)</label>
                <input type="number" className="input-field" value={data.deductions?.sec80d_self || ''} onChange={(e) => handleChange('deductions', 'sec80d_self', parseFloat(e.target.value) || 0)} placeholder="e.g. 25000" />
             </div>
          </div>
        )
      case 'business':
        return (
           <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Do you run a Business or Profession?</h3>
             <div className="input-group mb-4">
                <label className="input-label">Gross Revenue / Receipts (₹)</label>
                <input type="number" className="input-field" value={data.business?.pnl?.revenueOperations || ''} onChange={(e) => {
                   updateData({...data, business: {...(data.business || {}), pnl: {...(data.business?.pnl || {}), revenueOperations: parseFloat(e.target.value) || 0}}})
                }} placeholder="0" />
             </div>
             <p className="text-sm border-l-4 border-primary pl-3 text-gray-600 mt-6">Note: For a detailed balance sheet, please switch to the Expert View later.</p>
          </div>
        )
      case 'capital':
        return (
           <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Did you sell any Shares, Mutual Funds, or Crypto?</h3>
             <div className="input-group mb-4">
                <label className="input-label">Profit from selling shares held LESS than 1 year (STCG) (₹)</label>
                <input type="number" className="input-field" value={data.capitalGains?.stcg_20 || ''} onChange={(e) => handleChange('capitalGains', 'stcg_20', parseFloat(e.target.value) || 0)} placeholder="0" />
             </div>
             <div className="input-group mb-4">
                <label className="input-label">Profit from selling shares held MORE than 1 year (LTCG) (₹)</label>
                <input type="number" className="input-field" value={data.capitalGains?.ltcg_125_equity || ''} onChange={(e) => handleChange('capitalGains', 'ltcg_125_equity', parseFloat(e.target.value) || 0)} placeholder="0" />
             </div>
             <div className="input-group mb-4">
                <label className="input-label">Virtual Digital Assets (Crypto) Profit (₹)</label>
                <input type="number" className="input-field" value={data.crypto?.totalTaxableGain || ''} onChange={(e) => {
                   updateData({...data, crypto: {...(data.crypto || {}), totalTaxableGain: parseFloat(e.target.value) || 0}})
                }} placeholder="0" />
             </div>
          </div>
        )
      case 'other':
        return (
           <div className="slide-up text-left w-full max-w-2xl mx-auto">
             <h3 className="text-xl font-bold mb-6">Any other passive income?</h3>
             <p className="text-sm text-gray-500 mb-4">Such as interest from banks or dividend payouts.</p>
             <div className="input-group mb-4">
                <label className="input-label">Interest from Savings Bank Accounts (₹)</label>
                <input type="number" className="input-field" value={data.otherSources?.savings || ''} onChange={(e) => handleChange('otherSources', 'savings', parseFloat(e.target.value) || 0)} placeholder="0" />
             </div>
             <div className="input-group mb-4">
                <label className="input-label">Interest from Fixed Deposits (FD) (₹)</label>
                <input type="number" className="input-field" value={data.otherSources?.fds || ''} onChange={(e) => handleChange('otherSources', 'fds', parseFloat(e.target.value) || 0)} placeholder="0" />
             </div>
          </div>
        )
      case 'summary':
        return (
          <div className="slide-up text-center">
             <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '1.5rem' }}>
                <CheckCircle size={48} />
             </div>
             <h3 className="text-2xl font-bold mb-4">All Set!</h3>
             <p className="text-gray-500 mb-6">We have gathered the basic details. Let's switch back to the Expert Dashboard to view your full tax computation, compare regimes, and export your ITR JSON.</p>
             <button className="btn btn-primary" onClick={exitGuidedMode}>Go to Tax Dashboard</button>
          </div>
        )
      default:
        return null
    }
  }

  const progress = (step / (steps.length - 1)) * 100

  return (
    <div style={{
       position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
       background: 'var(--bg-color)', zIndex: 9999, 
       display: 'flex', flexDirection: 'column'
    }}>
       <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div className="font-bold text-lg" style={{ color: 'var(--primary)' }}>TaxNova Pro Guided Setup</div>
          <button className="btn btn-sm btn-secondary" onClick={exitGuidedMode}>Exit to Expert Mode</button>
       </div>
       
       <div style={{ width: '100%', height: '4px', background: 'var(--border-color)' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
       </div>

       <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
          {renderContent()}
       </div>

       {step > 0 && step < steps.length - 1 && (
         <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Next <ArrowRight size={16} /></button>
         </div>
       )}
    </div>
  )
}

// Temporary CheckCircle icon component for this file
const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

export default GuidedMode
