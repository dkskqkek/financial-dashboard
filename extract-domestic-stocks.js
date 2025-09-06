// 로컬스토리지에서 주식 데이터를 추출하고 국내주식을 분류하는 스크립트

function extractDomesticStocks() {
  // 로컬 스토리지에서 데이터 가져오기
  const storageData = localStorage.getItem('financial-dashboard-store');
  
  if (!storageData) {
    console.log('❌ 저장된 데이터가 없습니다.');
    return {
      error: '저장된 데이터가 없습니다.',
      totalStocks: 0,
      domesticStocks: [],
      foreignStocks: [],
      etfs: [],
      bonds: [],
      classification: {}
    };
  }

  let data;
  try {
    data = JSON.parse(storageData);
  } catch (e) {
    console.error('❌ 데이터 파싱 오류:', e);
    return {
      error: '데이터 파싱 오류',
      totalStocks: 0,
      domesticStocks: [],
      foreignStocks: [],
      etfs: [],
      bonds: [],
      classification: {}
    };
  }

  if (!data.state || !data.state.stocks) {
    console.log('❌ 주식 데이터가 없습니다.');
    return {
      error: '주식 데이터가 없습니다.',
      totalStocks: 0,
      domesticStocks: [],
      foreignStocks: [],
      etfs: [],
      bonds: [],
      classification: {}
    };
  }

  const stocks = data.state.stocks;
  
  // Dashboard.tsx의 분류 로직 적용
  function classifyStock(stock) {
    const isKoreanListed = stock.exchange === 'KRX' || /^\d{6}$/.test(stock.symbol);
    
    // ETF 판별
    const isEtf = stock.name.includes('ETF') || 
                  stock.name.includes('etf') ||
                  stock.symbol.toUpperCase().includes('ETF') ||
                  stock.name.includes('펀드') ||
                  stock.name.includes('FUND');
    
    // 채권 판별
    const isBond = stock.sector === '채권' ||
                   stock.name.includes('채권') ||
                   stock.name.includes('Bond') ||
                   stock.name.includes('BOND') ||
                   stock.name.includes('회사채') ||
                   stock.name.includes('국고채') ||
                   stock.name.includes('TIPS') ||
                   stock.name.includes('Treasury');
    
    return {
      isKoreanListed,
      isEtf,
      isBond,
      classification: isBond ? 'bond' : (isEtf ? (isKoreanListed ? 'domesticEtf' : 'foreignEtf') : (isKoreanListed ? 'domesticStock' : 'foreignStock'))
    };
  }

  // 주식 분류
  const result = {
    totalStocks: stocks.length,
    domesticStocks: [],
    foreignStocks: [],
    domesticEtfs: [],
    foreignEtfs: [],
    bonds: [],
    classification: {}
  };

  stocks.forEach((stock, index) => {
    const analysis = classifyStock(stock);
    
    // 분류별로 저장
    const stockWithAnalysis = {
      ...stock,
      analysisResult: analysis
    };
    
    switch (analysis.classification) {
      case 'domesticStock':
        result.domesticStocks.push(stockWithAnalysis);
        break;
      case 'foreignStock':
        result.foreignStocks.push(stockWithAnalysis);
        break;
      case 'domesticEtf':
        result.domesticEtfs.push(stockWithAnalysis);
        break;
      case 'foreignEtf':
        result.foreignEtfs.push(stockWithAnalysis);
        break;
      case 'bond':
        result.bonds.push(stockWithAnalysis);
        break;
    }
  });

  // 콘솔 출력
  console.log('\n📊 주식 분류 결과');
  console.log('='.repeat(50));
  console.log(`전체 보유 종목: ${result.totalStocks}개`);
  console.log(`🇰🇷 국내주식: ${result.domesticStocks.length}개`);
  console.log(`📈 국내 ETF: ${result.domesticEtfs.length}개`);
  console.log(`🌍 해외주식: ${result.foreignStocks.length}개`);
  console.log(`📊 해외 ETF: ${result.foreignEtfs.length}개`);
  console.log(`📋 채권: ${result.bonds.length}개`);
  
  if (result.domesticStocks.length > 0) {
    console.log('\n🇰🇷 국내주식 상세:');
    console.log('-'.repeat(30));
    result.domesticStocks.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.name} (${stock.symbol})`);
      console.log(`   거래소: ${stock.exchange || 'N/A'} | 섹터: ${stock.sector || 'N/A'}`);
      console.log(`   시장가치: ${(stock.marketValue || 0).toLocaleString()}${stock.currency || ''}`);
      console.log(`   분류 근거: 거래소=${stock.exchange}, 심볼=${stock.symbol} (6자리 체크: ${/^\d{6}$/.test(stock.symbol)})`);
      console.log('');
    });
  }

  if (result.domesticEtfs.length > 0) {
    console.log('\n📈 국내 ETF 상세:');
    console.log('-'.repeat(30));
    result.domesticEtfs.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.name} (${stock.symbol})`);
      console.log(`   거래소: ${stock.exchange || 'N/A'} | 섹터: ${stock.sector || 'N/A'}`);
      console.log(`   시장가치: ${(stock.marketValue || 0).toLocaleString()}${stock.currency || ''}`);
      console.log('');
    });
  }

  console.log('\n📋 분류 기준:');
  console.log('• 국내주식: 거래소=KRX 또는 심볼이 6자리 숫자, ETF/채권이 아닌 일반 주식');
  console.log('• ETF: 종목명에 "ETF", "etf", "펀드", "FUND" 포함');
  console.log('• 채권: 섹터가 "채권"이거나 종목명에 채권 관련 키워드 포함');

  return result;
}

// 결과를 글로벌 변수에 저장
window.stockAnalysis = extractDomesticStocks();

console.log('\n📝 결과가 window.stockAnalysis에 저장되었습니다.');
console.log('상세 데이터는 window.stockAnalysis를 통해 확인할 수 있습니다.');