import React, { useState, useEffect } from 'react'

const CurrencyInput = ({ name, value, onChange, placeholder, disabled, className }) => {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('')
    } else {
      const num = parseFloat(value)
      if (!isNaN(num)) {
        setDisplayValue(num.toLocaleString('en-IN'))
      } else {
        setDisplayValue(String(value))
      }
    }
  }, [value])

  const handleBlur = () => {
    if (displayValue !== '') {
       const cleanStr = displayValue.replace(/,/g, '')
       const num = parseFloat(cleanStr)
       if (!isNaN(num)) {
          setDisplayValue(num.toLocaleString('en-IN'))
       }
    }
  }

  const handleChange = (e) => {
    const rawVal = e.target.value
    // Allow numbers, commas, and negative signs, but restrict otherwise
    if (!/^[0-9.,-]*$/.test(rawVal)) {
        return
    }
    setDisplayValue(rawVal)
    
    // Pass raw number up
    const cleanStr = rawVal.replace(/,/g, '')
    const num = cleanStr === '' ? '' : parseFloat(cleanStr)
    if (onChange) {
      // Fake event structure for existing handlers
      onChange({ target: { name, value: num } })
    }
  }

  return (
    <input
      type="text"
      name={name}
      className={className || 'input-field'}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      inputMode="numeric"
    />
  )
}

export default CurrencyInput
