const parseDate = (d) => {
    if (!d) return new Date()
    if (d instanceof Date) return d
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const dStr = String(d).trim().toLowerCase()
    const parts = dStr.split(/[\s\-\/]+/)
    if (parts.length === 3) {
       let day = parseInt(parts[0])
       let month = months.indexOf(parts[1].substring(0, 3))
       let year = parseInt(parts[2])
       if (month !== -1) return new Date(year, month, day)
       month = parseInt(parts[1]) - 1
       return new Date(year, month, day)
    }
    return new Date(dStr)
}

const testTrades = [
    { type: 'Listed Equity', buyDate: '5 May 2023', buyVal: 175000, sellDate: '7 Sep 2025', sellVal: 225000, exp: 1500 },
    { type: 'Listed Equity', buyDate: '14 May 2025', buyVal: 165400, sellDate: '13 Jan 2026', sellVal: 150000, exp: 2400 },
    { type: 'MF (Equity)', buyDate: '5 May 2025', buyVal: 15000, sellDate: '8 Jan 2026', sellVal: 24000, exp: 1000 },
    { type: 'MF (Equity)', buyDate: '14 May 2025', buyVal: 150000, sellDate: '7 Jan 2026', sellVal: 148000, exp: 2000 }
];

let totals = { stcg_20: 0, stcg_normal: 0, ltcg_125_equity: 0, ltcg_125_other: 0 };

testTrades.forEach(trade => {
    const buyDate = parseDate(trade.buyDate);
    const sellDate = parseDate(trade.sellDate);
    const timeDiff = sellDate.getTime() - buyDate.getTime();
    const daysHeld = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const gain = trade.sellVal - trade.buyVal - trade.exp;

    let isLTCG = false;
    let category = 'normal';

    if (trade.type.includes('Listed') || trade.type === 'MF (Equity)') {
        isLTCG = daysHeld > 365;
        category = isLTCG ? 'equity_ltcg' : 'equity_stcg';
    }

    if (isLTCG) {
        if (category === 'equity_ltcg') totals.ltcg_125_equity += gain;
        else totals.ltcg_125_other += gain;
    } else {
        if (category === 'equity_stcg') totals.stcg_20 += gain;
        else totals.stcg_normal += gain;
    }
});

console.log('Results:', totals);
console.log('Expected STCG: -13800, Got:', totals.stcg_20);
console.log('Expected LTCG: 48500, Got:', totals.ltcg_125_equity);

if (totals.stcg_20 === -13800 && totals.ltcg_125_equity === 48500) {
    console.log('SUCCESS: Logic verified.');
} else {
    console.log('FAILURE: Totals do not match.');
    process.exit(1);
}
