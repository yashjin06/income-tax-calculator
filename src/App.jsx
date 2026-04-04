import React, { useState, useEffect } from 'react'
import { Calculator, User, Briefcase, Home, FileText, Download, Activity, FileSpreadsheet, Percent, Moon, Sun, ShieldCheck, UploadCloud, Lightbulb, Calendar, Menu, X } from 'lucide-react'
import PersonalInfo from './components/PersonalInfo'
import Salary from './components/Salary'
import HouseProperty from './components/HouseProperty'
import PGBP from './components/PGBP'
import CapitalGains from './components/CapitalGains'
import OtherSources from './components/OtherSources'
import Deductions from './components/Deductions'
import ExemptIncome from './components/ExemptIncome'
import IncomeSummary from './components/IncomeSummary'
import TaxComputation from './components/TaxComputation'
import TaxBreakup from './components/TaxBreakup'
import BroughtForwardLosses from './components/BroughtForwardLosses'
import TaxesPaid from './components/TaxesPaid'
import AdvanceTaxWarning from './components/AdvanceTaxWarning'
import { generatePDF } from './exports/pdfExport'
import { generateWord } from './exports/wordExport'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('personal')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [taxData, setTaxData] = useState({
    personal: {
      name: '',
      pan: '',
      assessmentYear: '2026-27',
      category: 'Individual',
      residentialStatus: 'resident',
      ageCategory: 'below60',
      newRegime: 'yes'
    },
    salary: {},
    houseProperty: [],
    business: {},
    capitalGains: {},
    otherSources: {},
    deductions: {},
    exemptIncome: []
  })

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
      // Update browser chrome color for Android/iOS
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#0f172a')
    } else {
      document.body.classList.remove('dark')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#f8fafc')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const updateData = (newData) => {
    setTaxData(newData)
  }

  // Calculate high-level summary if needed
  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfo data={taxData} updateData={updateData} />
      case 'taxes-paid':
        return <TaxesPaid data={taxData} updateData={updateData} />
      case 'salary':
        return <Salary data={taxData} updateData={updateData} />
      case 'house':
        return <HouseProperty data={taxData} updateData={updateData} />
      case 'business':
        return <PGBP data={taxData} updateData={updateData} />
      case 'capital':
        return <CapitalGains data={taxData} updateData={updateData} />
      case 'otherSources':
        return <OtherSources data={taxData} updateData={updateData} />
      case 'bfl':
        return <BroughtForwardLosses data={taxData} updateData={updateData} />
      case 'deductions':
        return <Deductions data={taxData} updateData={updateData} />
      case 'exemptIncome':
        return <ExemptIncome data={taxData} updateData={updateData} />
      case 'summary':
        return <IncomeSummary data={taxData} />
      case 'computation':
        return <TaxComputation data={taxData} />
      case 'tax-breakup':
        return <TaxBreakup data={taxData} />
      case 'advance-tax':
        return <AdvanceTaxWarning data={taxData} />
      default:
        return <div className="glass-panel p-6 slide-up"><h2>Module coming soon</h2></div>
    }
  }

  const handleNavSelect = (tabId) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar-logo" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            <Calculator size={18} color="#ffffff" />
          </div>
          <div className="sidebar-title" style={{ fontSize: '1.1rem' }}>TaxNova <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Pro</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dark mode toggle — accessible in mobile topbar */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '38px', height: '38px',
              borderRadius: '10px',
              background: 'var(--input-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {/* Hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: 'var(--input-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Calculator size={20} />
          </div>
          <div className="sidebar-title">TaxNova<br/><span style={{fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)'}}>Pro Calculator</span></div>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => handleNavSelect('personal')}>
            <User size={20} />
            <span>Profile & Regime</span>
          </button>
          
          <div className="nav-section-title">Income Heads</div>
          <button className={`nav-item ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => handleNavSelect('salary')}>
            <FileText size={20} />
            <span>Salary</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'house' ? 'active' : ''}`} onClick={() => handleNavSelect('house')}>
            <Home size={20} />
            <span>House Property</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'business' ? 'active' : ''}`} onClick={() => handleNavSelect('business')}>
            <Briefcase size={20} />
            <span>Business / PGBP</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'capital' ? 'active' : ''}`} onClick={() => handleNavSelect('capital')}>
            <Activity size={20} />
            <span>Capital Gains</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'otherSources' ? 'active' : ''}`} onClick={() => handleNavSelect('otherSources')}>
            <FileSpreadsheet size={20} />
            <span>Other Sources</span>
          </button>
          
          <button className={`nav-item ${activeTab === 'bfl' ? 'active' : ''}`} onClick={() => handleNavSelect('bfl')}>
            <Activity size={20} />
            <span>B/F Losses</span>
          </button>

          <div className="nav-section-title">Tax & Regimes</div>
          <div className="nav-group">
            <button className={`nav-item ${activeTab === 'taxes-paid' ? 'active' : ''}`} onClick={() => handleNavSelect('taxes-paid')}>
              <ShieldCheck size={20} />
              <span>Taxes Paid (TDS/TCS)</span>
            </button>
            <button className={`nav-item ${activeTab === 'deductions' ? 'active' : ''}`} onClick={() => handleNavSelect('deductions')}>
              <ShieldCheck size={20} />
              <span>Deductions</span>
            </button>
            <button className={`nav-item ${activeTab === 'exemptIncome' ? 'active' : ''}`} onClick={() => handleNavSelect('exemptIncome')}>
              <Percent size={20} />
              <span>Exempt Income u/s 10</span>
            </button>
            <button className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => handleNavSelect('summary')}>
              <FileText size={20} />
              <span>Income Summary</span>
            </button>
          </div>

          <h3 className="nav-section-title">Reports & Analysis</h3>
          <div className="nav-group">
            <button className={`nav-item ${activeTab === 'computation' ? 'active' : ''}`} onClick={() => handleNavSelect('computation')}>
              <Calculator size={20} />
              <span>Tax Computation</span>
            </button>
            <button className={`nav-item ${activeTab === 'advance-tax' ? 'active' : ''}`} onClick={() => handleNavSelect('advance-tax')}>
              <Calendar size={20} />
              <span>Advance Tax & Penalties</span>
            </button>
            <button className={`nav-item ${activeTab === 'tax-breakup' ? 'active' : ''}`} onClick={() => handleNavSelect('tax-breakup')}>
              <FileText size={20} />
              <span>Tax Breakup Details</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-banner fade-in">
          <div>
            <h1>Comprehensive Tax Calculator</h1>
            <p>Assessment Year: {taxData.personal.assessmentYear} | Assessee: {taxData.personal.name || 'Not provided'}</p>
          </div>
          <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
             <button className="btn btn-secondary" onClick={toggleDarkMode} style={{ padding: '0.625rem', borderRadius: '50%' }} title="Toggle Dark Mode">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button className="btn btn-secondary" onClick={() => generateWord(taxData)}>
               <FileText size={16} />
               Export Word
             </button>

             <button className="btn btn-primary" onClick={() => generatePDF(taxData)}>
               <Download size={16} />
               Export PDF
             </button>
          </div>
        </header>

        <section className="content-area">
          {renderContent()}
        </section>
      </main>
    </div>
  )
}

export default App
