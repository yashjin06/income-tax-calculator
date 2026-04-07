import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const PersonalInfo = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, personal: { ...data.personal, [name]: value } });
  };

  return (
    <div className="fade-in">
      <div className="card p-6 mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1.5rem' }}>Assessee Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="input-field" 
              placeholder="e.g. John Doe" 
              value={data?.personal?.name || ''} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">PAN Number</label>
            <input 
              type="text" 
              name="pan" 
              className="input-field" 
              placeholder="e.g. ABCDE1234F" 
              style={{ textTransform: 'uppercase' }}
              value={data?.personal?.pan || ''} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Aadhaar Number</label>
            <input 
              type="text" 
              name="aadhaar" 
              className="input-field" 
              placeholder="12-digit Aadhaar" 
              value={data?.personal?.aadhaar || ''} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="input-field" 
              placeholder="your@email.com" 
              value={data?.personal?.email || ''} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <input 
              type="tel" 
              name="mobile" 
              className="input-field" 
              placeholder="10-digit Mobile Number" 
              value={data?.personal?.mobile || ''} 
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Date of Birth</label>
            <DatePicker
              selected={data?.personal?.dob ? new Date(data.personal.dob) : null}
              onChange={(date) => {
                if(date) {
                   const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                   updateData({...data, personal: {...data.personal, dob: offsetDate.toISOString().split('T')[0]}});
                } else {
                   updateData({...data, personal: {...data.personal, dob: ''}});
                }
              }}
              dateFormat="dd/MM/yyyy"
              className="input-field w-full"
              placeholderText="Select your birth date"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
              portalId="root-portal"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Assessment Year</label>
            <select 
              name="assessmentYear" 
              className="input-field" 
              value={data?.personal?.assessmentYear || '2024-25'} 
              onChange={handleChange}
            >
              <option value="2023-24">2023-24 (FY 2022-23)</option>
              <option value="2024-25">2024-25 (FY 2023-24)</option>
              <option value="2025-26">2025-26 (FY 2024-25)</option>
              <option value="2026-27">2026-27 (FY 2025-26)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Assessee Category</label>
            <select 
              name="category" 
              className="input-field"
              value={data?.personal?.category || 'Individual'} 
              onChange={handleChange}
            >
              <option value="Individual">Individual</option>
              <option value="HUF">HUF</option>
              <option value="Firm">Firm / LLP</option>
              <option value="Company">Company</option>
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Residential Status</label>
            <select 
              name="residentialStatus" 
              className="input-field"
              value={data?.personal?.residentialStatus || 'resident'} 
              onChange={handleChange}
            >
              <option value="resident">Resident & Ordinarily Resident</option>
              <option value="nri">Non-Resident (NRI)</option>
              <option value="rnor">Resident but Not Ordinarily Resident (RNOR)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Age Category</label>
            <select 
              name="ageCategory" 
              className="input-field"
              value={data?.personal?.ageCategory || 'below60'} 
              onChange={handleChange}
            >
              <option value="below60">Below 60 Years</option>
              <option value="senior">Senior Citizen (60 - 79 Years)</option>
              <option value="superSenior">Super Senior Citizen (80+ Years)</option>
            </select>
          </div>
          
          <div className="input-group">
            <label className="input-label">Opting for New Regime (Sec 115BAC)?</label>
            <select 
              name="newRegime" 
              className="input-field"
              value={data?.personal?.newRegime || 'yes'} 
              onChange={handleChange}
            >
              <option value="yes">Yes (Default for FY 23-24 onwards)</option>
              <option value="no">No (Old Regime)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card p-6 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1.5rem' }}>Address Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Flat/Door/Block No & Premises</label>
            <input 
              type="text" 
              name="address1" 
              className="input-field" 
              value={data?.personal?.address1 || ''} 
              onChange={handleChange} 
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Road/Street</label>
            <input type="text" name="street" className="input-field" value={data?.personal?.street || ''} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label className="input-label">City/Town/District</label>
            <input type="text" name="city" className="input-field" value={data?.personal?.city || ''} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label className="input-label">State</label>
            <input type="text" name="state" className="input-field" value={data?.personal?.state || ''} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label className="input-label">PIN Code</label>
            <input type="text" name="pincode" className="input-field" value={data?.personal?.pincode || ''} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="card p-6 slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1.5rem' }}>Bank Account Details</h2>
        <p className="text-sm text-gray-500 mb-4">Required for tax refund processing. Please provide at least one active account.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Bank Name</label>
            <input 
              type="text" 
              name="bankName" 
              className="input-field" 
              placeholder="e.g. State Bank of India" 
              value={data?.personal?.bankName || ''} 
              onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Account Number</label>
            <input 
              type="text" 
              name="accountNumber" 
              className="input-field" 
              placeholder="Enter Account Number" 
              value={data?.personal?.accountNumber || ''} 
              onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label className="input-label">IFSC Code</label>
            <input 
              type="text" 
              name="ifscCode" 
              className="input-field" 
              placeholder="e.g. SBIN0001234" 
              style={{ textTransform: 'uppercase' }}
              value={data?.personal?.ifscCode || ''} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
