import React, { useState, useEffect } from 'react'

const CurrencyInput = ({ name, value, onChange, placeholder, disabled, className, max, style }) => {
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
    let rawVal = e.target.value
    if (!/^[0-9.,-]*$/.test(rawVal)) {
        return
    }
    
    const cleanStr = rawVal.replace(/,/g, '')
    let num = cleanStr === '' ? '' : parseFloat(cleanStr)

    if (max !== undefined && num !== '' && num > max) {
      num = max
      rawVal = max.toLocaleString('en-IN')
    }

    setDisplayValue(rawVal)
    
    if (onChange) {
      onChange({ target: { name, value: num } })
    }
  }

  return (
    <input
      type="text"
      name={name}
      className={className || 'input-field'}
      style={style}
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
