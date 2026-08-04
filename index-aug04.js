/* Cập nhật theo Hướng dẫn sửa WEB.docx ngày 04/08/2026 */
(() => {
  const tradeBalances = [30602.0,30608.8,30607.5,30599.1,30677.2,30809.9,31435.7,32295.2,33102.0,33520.5,34264.9,34588.2,34747.0,33890.8,32653.2,41403.2,39141.2,36883.4,34610.1,33404.4,33124.4,32883.7,32795.9,33100.7,33528.6,33689.8,34019.8,34573.7,36677.3,35819.0,34331.3,34031.5,33921.5,33456.4,34121.0,34800.8,35767.7,36505.2,37784.9,37819.5,37338.7,36912.3,36976.5,36359.8,35404.9,36267.7,37367.2,38402.2,38886.3,39079.8,40596.5,42957.0,44347.4,44778.5,45043.0,44922.3,44574.9,44229.2,45060.6,46149.9,47074.4,47542.9,47697.1,47739.2,47675.3,47597.9,48260.0,48743.0,49063.5,49385.5,50211.0,50775.8,50503.9,50351.6,50188.1,49851.2,49636.5,49455.5,47568.5,42228.5,39115.5,68339.5,83530.0,78030.17,77828.2,77601.75,77394.32,77164.49,77638.29,78077.89,78648.89,78680.09,78321.89,75898.79,73419.59,70980.19,74261.19,77848.39,78722.49,78483.59,77686.49,74369.49,72927.39,74749.59,76717.29,78796.59,80923.29,82962.09,84924.99,86158.19,86500.59,86840.59,87098.39,85940.69,85678.19,84789.89,83448.49,82185.79,80923.69,80370.29,79050.29,80600.99,82209.89,83773.79,85371.89,86868.89,86641.19,86992.99,87370.09,87964.49,89238.09,90346.99,90066.79,90037.09,89904.79,87308.89,85067.29,84622.79,84278.89,83941.29,82986.09,81818.79,81438.99,84953.99,88706.99,91309.49,91945.19,92252.49,92526.89,92806.59,93487.79,94309.09,94682.49,95594.49,95704.59,96032.89,96310.39,96396.79,95937.79,95515.39,95408.79,95580.89,95537.79,95752.99,96014.69,98192.99,98622.79,94197.39,93245.19,91893.19,92138.59,93699.39,95177.59,95463.19,96154.39,96464.59,96857.89,97427.49,97934.39,98428.49,97860.19,99010.89,99615.39,99652.89,102672.89,105592.69,106395.89,107166.89,106056.39,105216.89,104769.99,104577.09,105107.59,105334.19,105733.69,106014.99,106261.49,106591.09,107333.69,107624.79,104889.69,104889.69,106083.99,106055.39,105695.49,105225.29,104074.49,103963.79,105273.29,105988.29,107361.99,107679.39,108509.99,103066.99,104103.19,103567.09,103305.39,104256.19,104683.39,105042.99,105330.09,105716.69,106180.99,106758.69,107302.89,107556.59,107342.29,107183.29,107088.79,106960.29,106863.49,106354.89,106027.99,105708.09,104732.89,103666.69,102828.49,103394.69,104052.29,104888.89,105815.49,106718.49,107630.09,108616.69,109752.89,111181.69,111201.29,110950.69,110735.69,111042.39,111543.59,111556.19,111797.79,112044.39,112640.79,112843.29,113073.09,113661.79,113908.09,114244.29,113578.29,113231.69,112999.39,112862.99,112630.69,112311.39,111093.69,109422.09,107655.09,110438.59,113209.09,115808.59,114911.89,114290.19,113581.49,113027.99,112526.39,113155.39,118131.79,118011.29,117813.99,117520.99,117156.59,116778.89,116354.49,116809.69,117248.19,117635.09,118052.09,118076.89,117906.59,117626.69,117503.29,117348.49,117211.19,117072.39,116915.89,116787.29,116848.79,117020.39,117109.49,116958.09,116149.79,115793.99,115600.89,115446.89,117922.39,120169.99,117703.99,116087.59,120634.39,122019.39,122294.79,122490.49,122578.99,126475.99,128314.09,128968.09,130109.69,125533.99,124956.59,125431.99,126689.29,126706.79,126989.49,127527.49,128440.39,128951.19,128795.89,128636.39,128373.59,128035.99,127646.69,127121.89,127948.89,128717.89,127845.39,127152.39,126300.89,125370.39,124219.89,125458.39,126610.39,127763.89,129160.89,130615.39,133713.89,136157.89,135622.23,134986.43,132528.93,132106.93,131318.33,130518.93,132638.93,135635.43,137233.63,140052.13,135463.03,135015.53,134412.43,134143.13,133917.83,132988.83,132645.03,134572.03,136705.03,138420.43,138554.93,138615.43,139304.23,139820.23,140886.93,140084.83,139458.93,138617.63,137892.43,137247.93,137651.53,139788.03,140147.43,140539.63,142066.63,142644.23,143006.03,143328.23,143650.43,145390.13,146969.03,148876.83,148264.05,147608.47,149135.17,149638.17,150798.77,151903.77,152024.47,152130.37,152372.57,152604.57,152907.07,153813.27,154307.77,154615.47,154962.17,155992.27,156959.97,157897.17,159565.97,159442.17,159225.97,158997.97,158935.57,160306.07,160985.67,161257.37,164466.87,165812.27,166715.17,166663.67,166916.67,166786.97,166780.67,166714.97,166839.57,167314.17,167377.07,168156.87,168934.87,165887.07,164526.17,164345.47,164164.17,163964.37,164007.67,163834.97,163605.67,163641.07,163663.57,163831.97,164059.97,163572.37,162790.87,162318.67,161771.17,161246.57,161020.97,160247.47,159497.17,158268.67,156172.67,155795.87,155581.97,155232.77,157261.77,159363.77,160902.27,162697.77,164775.77,164167.97,163793.37,164599.17,165400.57,166184.47,167032.27,167885.87,169307.97,168442.87,168222.07,168051.97,168752.47,169499.47,170563.27,171759.07,173066.47,174562.27,173737.77,173309.67,172531.87,171690.67,170681.67,169685.67,168846.17,167868.17,166408.17,164944.17,163484.17,161842.17,160193.67,158729.67,157269.67,159342.17,161361.67,163430.67,165617.67,167844.67,170065.67,172254.17,174427.67,176625.17,177931.97,177914.57,178425.47,178449.67,178767.37,178120.37,179305.97,180496.57,182095.17,183752.37,179009.77,178265.77,177630.37,179507.37,181241.87,182235.77,182879.37,180271.27,177620.17,177132.47,176600.47,176068.47,175536.47,174680.97,166931.97,166994.97,167081.97,167167.97,166365.47,165738.22,165711.22,165731.72,165752.22,159572.47,153689.07,147421.32,169308.32,178645.32,199348.32,199344.62,199443.92,199517.92,199514.27,198526.97,196860.17,200013.67,207588.42,209200.07,210442.58,210757.78,210262.88,209763.98,209166.68,208577.78,207995.58,209435.1,208898.1,208365.6,208084.6,209318.6,210551.1,211798.6,212834.6,213976.1,214398.7,215032.9,211713.4,211326.4,210518.8,210008.9,209741.5,208593.5,207362.5,205917.5,205200.0,205200.0,204481.0,204481.0,203644.5,203644.5,202912.5,202912.5,202063.0,202063.0,201525.5,201525.5,200915.0,200915.0,200474.0,200474.0,200303.5,200183.5,197957.5,195734.5,193947.5,192558.5,190911.5,188657.5,186277.5,183502.5,185867.5,190060.0,194860.0,199647.5,204312.5,209632.5,214065.0,218725.0,222812.5,220756.9,219963.3,219498.5,220999.7,221473.75,221751.05,222381.05,223882.55,223093.05,222990.65,223611.35,224338.35,224940.55,225602.75,226408.35,227436.15,228444.25,227485.75,226557.25,227665.45,228822.55,229465.15,230120.95,231049.45,231251.05,230766.35,230291.95,229858.55,229416.55,228224.55,228180.05,227443.05,228209.05,229238.55,230453.55,231592.05,232624.55,233212.4,233515.67,232444.67,230584.67,233227.67,235978.17,236113.97,236211.77,231876.17,236530.57,238974.77,238418.27,239517.97,240108.07,240711.77,240323.27,239437.47,238574.47,237579.97,236354.97,235387.47,234165.97,232927.47,231719.97,230546.97,229292.47,228084.97,226994.97,229175.97,232011.97,235152.97,238632.97,242153.97,245732.97,244583.47,245929.97,247463.97,249592.47,249815.37,250039.37,250192.77,250392.07,250816.37,250999.27,248896.27,248542.87,247860.07,247250.17,245082.17,242907.67,240742.67,243296.67,246015.67,248569.67,251123.67,253677.67,256231.67,258785.67,261504.67,264058.67,266638.67,268966.67,268460.27,271104.97,272301.27,273413.77,274673.27,274268.17,271651.47,271077.47,270369.27,269092.27,267465.27,268936.27,270496.27,272050.77,273626.77,275400.27,276638.07,282867.32,282436.13,284047.88,285547.43,284779.33,283851.63,282931.63,282345.63,281401.33,283070.83,282809.08,283893.58,283576.68,284354.13,284869.48,285800.33,286763.73,287638.23,286636.53,285741.55,284909.95,283186.2,282507.0,281827.8,280810.45,279086.4,278004.3,276408.35,277733.35,282501.95,283779.55,285404.55,287675.95,290261.75,294780.15,290630.55,289273.95,288932.65,290444.65,291991.65,293780.15,295467.15,295122.95,294778.75,294416.6,293424.8,292707.65,292043.0,291041.55,294785.85,298371.75,301729.35,302109.95,302408.75,305280.45,305969.95,305968.63,305992.68,306484.63,306065.98,305667.26,307101.96,307561.86,308078.76,305484.56,304529.26,303879.46,303560.41,303311.81,305336.11,307289.21,309241.31,311660.41,313519.51,316239.21,315513.61,314460.41,317685.41,319077.41,321622.91,322813.91,322919.61,323736.61,325584.61,331328.61,319216.61,310801.61,284655.11,282601.51,281498.21,277749.06,273546.76,272144.51,270790.21,269482.11,268242.31,267046.81,265961.81,263623.81,260102.81,256090.81,252447.31,259932.31,270091.31,277750.31,283069.31,290310.31,298466.31,306068.31,313566.31,321143.31,329730.31,338734.31,347671.31,343681.31,342525.71,349054.96,353425.26,357906.56,361223.56,360145.56,358332.86,357937.86,359036.36,362446.36,363919.36,365955.86,369845.06,370800.96,371633.06,372413.86,372535.76,371546.76,364868.76,366589.76,367215.26,369865.26,373160.26,376207.26,377777.56,375888.96,374028.96,374979.46,375943.96,376651.36,378110.16,378479.46,375888.71,373349.96,370614.46,370073.26,372923.26,375024.76,377508.76,379872.26,379644.86,378821.06,378447.26,376668.06,376213.76,376026.56,378225.56,380115.56,378154.56,376007.56,380376.56,383957.56,388267.56,392588.56,392109.46,391620.76,386566.26,381338.26,377820.76,374303.26,371999.26,377944.26,380110.26,381946.26,384733.26,393145.26,391725.66,390843.26,389995.66,384586.16,378837.16,373201.66,376099.16,371093.66,371092.42,370966.96,376744.46,383604.46,393906.96,393531.96,393351.66,393109.46,392829.06,392522.06,391388.06,390001.36,388807.96,386859.96,384712.96,382984.96,380606.96,379206.96,377740.96,375686.96,373309.96,371243.96,369206.96,367698.96,366185.96,359270.96,351208.46,345173.46,338518.46,341425.96,343388.46,345020.96,347250.96,349173.46,351873.46,357905.96,363978.46,370693.46,377228.46,384280.96,390245.96,393155.96,394180.46,394218.26];
  const reportStats = {
    period: '08–31.07.2026',
    initial: 30602,
    final: 394218.26,
    netProfit: 414690.26,
    profitFactor: 1.80,
    winRate: 54.75,
    drawdown: 22.96,
    trades: 957
  };

  const formatNumber = (value, digits = 2) => new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

  const syncAum = () => document.querySelectorAll('span').forEach((label) => {
    if (label.textContent.trim() === 'AUM') {
      const value = label.parentElement?.querySelector('strong');
      if (value && value.textContent.trim() !== '80 tỷ') value.textContent = '80 tỷ';
    }
  });
  syncAum();
  document.querySelector('#private-proof')?.addEventListener('click', () => setTimeout(syncAum));

  const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    if (node.nodeValue.includes('Chuyên gia Tư vấn Đầu tư Cao cấp tại SSI')) {
      node.nodeValue = node.nodeValue.replaceAll('Chuyên gia Tư vấn Đầu tư Cao cấp tại SSI', 'Chuyên gia Tư vấn Đầu tư Cấp cao tại SSI');
    }
  }
  document.querySelectorAll('[alt*="Cao cấp"]').forEach((image) => {
    image.alt = image.alt.replaceAll('Cao cấp', 'Cấp cao');
  });

  const pathways = document.querySelector('#private-pathways');
  if (pathways) {
    const intro = [...pathways.querySelectorAll('p')].find((item) => item.textContent.includes('Ba lộ trình'));
    if (intro) intro.textContent = 'Hai lộ trình rõ ràng, không yêu cầu bạn cung cấp OTP hay thông tin đăng nhập.';
    const cards = [...pathways.querySelectorAll('.private-pathway-card')];
    const firstDescription = cards[0]?.querySelector('h3 + p');
    if (firstDescription) firstDescription.textContent = 'Dành cho người chưa có tài khoản hoặc đang đầu tư tại các CTCK khác.';
    const guideLink = cards[1]?.querySelector('a.private-button');
    if (guideLink) {
      guideLink.href = 'chuyen-ma-ssi.html';
      guideLink.removeAttribute('target');
      guideLink.removeAttribute('rel');
    }
    cards[2]?.remove();
  }

  const community = document.querySelector('#private-community');
  if (community) {
    const title = community.querySelector('h2');
    const link = community.querySelector('a.private-button');
    if (title) title.textContent = 'Cùng học hỏi, chia sẻ kinh nghiệm từ cộng đồng những nhà đầu tư thông thái';
    if (link) {
      link.textContent = 'Tham gia cộng đồng chia sẻ kinh nghiệm đầu tư →';
      link.href = 'https://zalo.me/g/awu9n0xkftxzzocsrjlw';
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
  }

  const insights = document.querySelector('#private-insights');
  if (insights) {
    insights.classList.add('tci-insights-refresh');
    insights.innerHTML = `
      <div class="private-container">
        <div class="private-insights-header">
          <div><span class="private-kicker">Góc nhìn nổi bật</span><h2 id="private-insights-title">Được xem nhiều nhất</h2></div>
          <a class="private-insights-all" href="goc-nhin.html">Xem thư viện Góc nhìn ↗</a>
        </div>
        <div class="private-insights-grid">
          <a class="private-insight-card" href="chuyen-ma-ssi.html"><img src="chuyen-ma-ssi1.png" alt="Hướng dẫn chuyển mã chuyên viên tư vấn SSI 3186" loading="lazy"><span class="tci-insight-copy"><span>Hướng dẫn SSI</span><h3>Thay đổi ID Chuyên viên tư vấn trên SSI iBoard Pro</h3><p>Quy trình từng bước để chuyển mã chuyên viên tư vấn về 3186 và xác thực yêu cầu.</p><b>Đọc hướng dẫn →</b></span></a>
          <a class="private-insight-card" href="huong-dan-mo-tk-ssi.html"><img src="preview.png" alt="Mở tài khoản SSI cùng Bùi Thành Công" loading="lazy"><span class="tci-insight-copy"><span>Bắt đầu tại SSI</span><h3>Mở tài khoản SSI và gắn mã chuyên gia 3186</h3><p>Chuẩn bị hồ sơ, thực hiện eKYC và hoàn tất hợp đồng điện tử.</p><b>Đọc hướng dẫn →</b></span></a>
          <a class="private-insight-card" href="goc-nhin.html"><img src="TCI-logo.png" alt="Thư viện Góc nhìn Thành Công Investing" loading="lazy"><span class="tci-insight-copy"><span>Thư viện đầu tư</span><h3>Góc nhìn để ra quyết định có kỷ luật</h3><p>Các bài viết chọn lọc về thị trường, quy trình và quản trị rủi ro.</p><b>Xem các bài viết →</b></span></a>
        </div>
      </div>`;
  }

  document.querySelector('.private-chat-quick-actions')?.addEventListener('click', (event) => {
    const transferLink = event.target.closest('button[data-chat-action="transferlink"]');
    if (!transferLink) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = 'chuyen-ma-ssi.html';
  }, true);

  const buildTradeChart = () => {
    const values = tradeBalances.length ? tradeBalances : [reportStats.initial, reportStats.final];
    const width = 760, height = 270, padX = 18, padY = 22;
    const min = Math.min(...values), max = Math.max(...values);
    const range = Math.max(max - min, 1);
    const points = values.map((value, index) => {
      const x = padX + index * ((width - padX * 2) / Math.max(values.length - 1, 1));
      const y = height - padY - ((value - min) / range) * (height - padY * 2);
      return [x.toFixed(2), y.toFixed(2)];
    });
    const line = points.map((point) => point.join(',')).join(' ');
    const area = `${points[0][0]},${height - padY} ${line} ${points.at(-1)[0]},${height - padY}`;
    const grid = [0.25, 0.5, 0.75].map((ratio) => `<line class="grid" x1="${padX}" x2="${width - padX}" y1="${(padY + ratio * (height - padY * 2)).toFixed(1)}" y2="${(padY + ratio * (height - padY * 2)).toFixed(1)}"/>`).join('');
    return `<div class="tci-trade-chart-wrap"><svg class="tci-trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Biểu đồ số dư theo từng giao dịch trong báo cáo MT5 từ ngày 08 đến 31 tháng 7 năm 2026"><defs><linearGradient id="tciTradeAreaAug04" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#079b76" stop-opacity=".34"/><stop offset="1" stop-color="#079b76" stop-opacity="0"/></linearGradient></defs>${grid}<path class="area" d="M${area.replaceAll(',', ' ')} Z"/><polyline class="line" points="${line}"/><circle class="start" cx="${points[0][0]}" cy="${points[0][1]}" r="4"/><circle class="end" cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="5"/></svg><div class="tci-trade-caption"><span>${formatNumber(reportStats.initial, 0)} USD · đầu kỳ</span><span>${formatNumber(reportStats.final)} USD · cuối kỳ</span></div></div>`;
  };

  const latestAccountContent = () => `<div class="private-proof-panel-grid tci-proof-panel"><div class="private-proof-copy"><span class="private-kicker">Báo cáo MT5 · ${reportStats.period}</span><h3>Hiệu suất tài khoản Scalping XAUUSD và BTCUSD</h3><div class="tci-report-meta"><span>${reportStats.trades} giao dịch</span><span>Profit factor ${reportStats.profitFactor.toFixed(2)}</span><span>Win rate ${reportStats.winRate.toFixed(2)}%</span></div></div><div class="tci-account-card"><div class="tci-account-card__top"><span>Số dư cuối kỳ</span><strong>${formatNumber(reportStats.final)} USD</strong></div>${buildTradeChart()}<div class="tci-account-metrics"><div><span>Lợi nhuận ròng</span><strong>+${formatNumber(reportStats.netProfit)} USD</strong></div><div><span>Profit factor</span><strong>${reportStats.profitFactor.toFixed(2)}</strong></div><div><span>Win rate</span><strong>${reportStats.winRate.toFixed(2)}%</strong></div><div><span>Max drawdown</span><strong>${reportStats.drawdown.toFixed(2)}%</strong></div></div><p class="tci-report-note">Thực hiện theo chiến lược có mức độ rủi ro cao bởi nhà giao dịch chuyên nghiệp. Hiệu suất quá khứ không đảm bảo kết quả trong tương lai.</p></div></div>`;
  const latestCryptoContent = () => `<div class="private-proof-panel-grid tci-proof-panel tci-proof-panel--crypto"><div class="private-proof-copy"><span class="private-kicker">Kinh nghiệm đa thị trường</span><h3>Hiệu suất tài khoản Copy Trade Binance</h3><p>Hiệu suất tài khoản Copy Trade của ông Thành Công tại Binance. Hiệu suất quá khứ không đảm bảo kết quả trong tương lai.</p><div class="private-crypto-pair"><div class="is-return"><span>90D ROI</span><strong>+353,39%</strong></div><div class="is-risk"><span>Cut-off</span><strong>23.02.2026</strong></div></div></div><figure class="tci-performance-figure"><img src="IMG_1261.jpg" alt="Hiệu suất tài khoản Copy Trade của ông Thành Công tại Binance"/></figure></div>`;
  const renderLatestAccountPanel = () => {
    const panel = document.querySelector('.private-proof-desktop-panel');
    if (panel) panel.innerHTML = latestAccountContent();
  };
  document.querySelector('#private-proof-tab-mt5')?.addEventListener('click', renderLatestAccountPanel);
  document.querySelector('#private-proof-tab-crypto')?.addEventListener('click', () => {
    const panel = document.querySelector('.private-proof-desktop-panel');
    if (panel) panel.innerHTML = latestCryptoContent();
  });
  const mobileAccount = document.querySelectorAll('.private-proof-mobile-accordion details')[1];
  if (mobileAccount) {
    const summary = mobileAccount.querySelector('summary');
    const wrap = document.createElement('div');
    wrap.innerHTML = latestAccountContent();
    mobileAccount.replaceChildren(summary, wrap.firstElementChild);
  }
  const mobileCrypto = document.querySelectorAll('.private-proof-mobile-accordion details')[2];
  if (mobileCrypto) {
    const summary = mobileCrypto.querySelector('summary');
    const wrap = document.createElement('div');
    wrap.innerHTML = latestCryptoContent();
    mobileCrypto.replaceChildren(summary, wrap.firstElementChild);
  }

  const course = document.querySelector('#private-course');
  if (!course) return;
  course.querySelector('.private-ssi-eligibility')?.remove();
  const dateInput = course.querySelector('input[type="date"]');
  const timeSelect = course.querySelector('select');
  // Replace the exported buttons so stale/broken handlers from the static page
  // cannot overwrite the schedule state managed below.
  const dayButtons = [...course.querySelectorAll('button[aria-pressed]')].map((button) => {
    const replacement = button.cloneNode(true);
    replacement.setAttribute('aria-pressed', 'false');
    replacement.classList.remove('tci-day-selected');
    button.replaceWith(replacement);
    return replacement;
  });
  let autoSelectedButton = null;
  const autoNote = document.createElement('p');
  autoNote.className = 'tci-auto-day-note';
  autoNote.setAttribute('aria-live', 'polite');
  dateInput?.parentElement?.insertAdjacentElement('afterend', autoNote);
  dateInput?.addEventListener('change', () => {
    if (!dateInput.value) return;
    const day = new Date(`${dateInput.value}T12:00:00`).getDay();
    const labels = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const target = dayButtons.find((button) => button.textContent.trim() === labels[day]);
    if (autoSelectedButton && autoSelectedButton !== target && autoSelectedButton.getAttribute('aria-pressed') === 'true') autoSelectedButton.click();
    if (target && target.getAttribute('aria-pressed') !== 'true' && dayButtons.filter((button) => button.getAttribute('aria-pressed') === 'true').length >= 2) {
      dayButtons.find((button) => button !== target && button.getAttribute('aria-pressed') === 'true')?.click();
    }
    if (target && target.getAttribute('aria-pressed') !== 'true') target.click();
    autoSelectedButton = target || null;
    autoNote.textContent = target ? `Đã tự động chọn ${labels[day]} theo ngày bắt đầu dự kiến.` : '';
  });

  dayButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isSelected = button.getAttribute('aria-pressed') === 'true';
      if (!isSelected && dayButtons.filter((item) => item.getAttribute('aria-pressed') === 'true').length >= 2) {
        autoNote.textContent = 'Bạn chỉ có thể chọn tối đa 2 buổi học trong tuần.';
        return;
      }
      button.setAttribute('aria-pressed', String(!isSelected));
      button.classList.toggle('tci-day-selected', !isSelected);
      if (!isSelected) {
        const count = dayButtons.filter((item) => item.getAttribute('aria-pressed') === 'true').length;
        autoNote.textContent = count === 2
          ? 'Đã chọn đủ 2 buổi học trong tuần.'
          : 'Đã chọn 1 buổi. Vui lòng chọn thêm 1 ngày học.';
      } else {
        autoNote.textContent = 'Vui lòng chọn thêm 1 ngày học.';
      }
    });
  });

  const oldRegister = [...course.querySelectorAll('button')].find((button) => button.textContent.includes('Đăng ký lịch học'));
  if (!oldRegister) return;
  const register = oldRegister.cloneNode(true);
  register.textContent = 'Đăng ký học';
  oldRegister.replaceWith(register);

  const modal = document.createElement('section');
  modal.className = 'tci-payment-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'tci-payment-title');
  modal.innerHTML = `<div class="tci-payment-dialog"><header class="tci-payment-head"><span>Thanh toán bảo mật</span><h3 id="tci-payment-title">Thanh toán khóa học</h3><button class="tci-payment-close" type="button" aria-label="Đóng">×</button></header><div class="tci-payment-scroll"><div class="tci-payment-summary"></div><div class="tci-payment-tabs" role="tablist"><button class="tci-payment-tab is-active" type="button" data-pay-tab="bank">Banking VN</button><button class="tci-payment-tab" type="button" data-pay-tab="usdt">USDT (BEP20)</button><button class="tci-payment-tab" type="button" data-pay-tab="binance">Binance Pay</button></div><div class="tci-payment-panel" data-pay-panel="bank"><img class="tci-payment-qr" data-bank-qr alt="Mã VietQR thanh toán khóa học"><div class="tci-payment-details"><div class="tci-payment-row"><span>Ngân hàng</span><strong>Techcombank</strong></div><div class="tci-payment-row"><span>Số tài khoản</span><strong>6896 8925 9999</strong><button class="tci-copy" type="button" data-copy="689689259999">Sao chép</button></div><div class="tci-payment-row"><span>Chủ tài khoản</span><strong>BUI THANH CONG</strong></div><div class="tci-payment-row"><span>Nội dung bắt buộc</span><strong>KHDT_TEN_SDT</strong><button class="tci-copy" type="button" data-copy="KHDT_TEN_SDT">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-bank-amount></strong></div></div></div><div class="tci-payment-panel" data-pay-panel="usdt" hidden><img class="tci-payment-qr" data-usdt-qr alt="Mã QR ví USDT mạng BEP20"><div class="tci-payment-details"><div class="tci-payment-row"><span>Mạng lưới</span><strong>BEP20 · BNB Smart Chain</strong></div><div class="tci-payment-row"><span>Địa chỉ ví</span><strong>0x0b0661895a815cd929af65bcad8d55527d86f763</strong><button class="tci-copy" type="button" data-copy="0x0b0661895a815cd929af65bcad8d55527d86f763">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-usdt-amount></strong></div></div><p class="tci-payment-warning">Chỉ gửi USDT qua mạng BEP20 (BSC). Gửi sai mạng có thể làm mất tài sản.</p></div><div class="tci-payment-panel" data-pay-panel="binance" hidden><img class="tci-payment-qr" data-binance-qr alt="Mã QR Binance Pay"><div class="tci-payment-details"><div class="tci-payment-row"><span>Phương thức</span><strong>Binance Pay</strong></div><div class="tci-payment-row"><span>Pay ID</span><strong>879904257</strong><button class="tci-copy" type="button" data-copy="879904257">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-binance-amount></strong></div></div></div><a class="tci-payment-confirm" data-confirm-payment href="https://t.me/mmto1b" target="_blank" rel="noreferrer">Liên hệ Admin sau khi chuyển</a></div></div>`;
  document.body.append(modal);

  const closeModal = () => { modal.hidden = true; document.body.classList.remove('tci-modal-open'); };
  const selectedDays = () => dayButtons.filter((button) => button.getAttribute('aria-pressed') === 'true');
  const validateSchedule = () => {
    if (!dateInput?.value) { alert('Vui lòng chọn ngày bắt đầu dự kiến.'); return false; }
    const selected = selectedDays();
    if (selected.length !== 2) { alert('Vui lòng chọn đủ 2 buổi học trong tuần.'); return false; }
    const dayValue = (button) => ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].indexOf(button.textContent.trim());
    const rawDistance = Math.abs(dayValue(selected[0]) - dayValue(selected[1]));
    const weeklyDistance = Math.min(rawDistance, 7 - rawDistance);
    if (weeklyDistance < 3) { alert('Vui lòng chọn hai buổi học cách nhau ít nhất 2 ngày nghỉ.'); return false; }
    return true;
  };
  const openModal = () => {
    if (!validateSchedule()) return;
    const days = selectedDays().map((button) => button.textContent.trim()).join(' & ');
    const activeOffer = [...course.querySelectorAll('strong')].some((item) => item.textContent.includes('11.250.000'));
    const bankValue = activeOffer ? 11250000 : 15000000;
    const usdtValue = activeOffer ? 420 : 555;
    modal.querySelector('.tci-payment-summary').innerHTML = `<div><span>Lịch học</span><strong>${days}</strong></div><div><span>Khung giờ</span><strong>${timeSelect?.value || ''}</strong></div><div><span>Ngày bắt đầu</span><strong>${dateInput.value}</strong></div>`;
    modal.querySelector('[data-bank-amount]').textContent = `${formatNumber(bankValue, 0)} VND`;
    modal.querySelector('[data-usdt-amount]').textContent = `${usdtValue} USDT`;
    modal.querySelector('[data-binance-amount]').textContent = `${usdtValue} USDT`;
    const bankInfo = `KHDT_TEN_SDT`;
    modal.querySelector('[data-bank-qr]').src = `https://img.vietqr.io/image/970407-689689259999-compact2.png?amount=${bankValue}&addInfo=${encodeURIComponent(bankInfo)}&accountName=${encodeURIComponent('BUI THANH CONG')}`;
    modal.querySelector('[data-usdt-qr]').src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent('0x0b0661895a815cd929af65bcad8d55527d86f763')}`;
    modal.querySelector('[data-binance-qr]').src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent('879904257')}`;
    const message = `Chào Admin, tôi đã thanh toán khóa học.\n- Lịch: ${days}\n- Giờ: ${timeSelect?.value || ''}\n- Ngày bắt đầu: ${dateInput.value}\n- Giá: ${formatNumber(bankValue, 0)} VND`;
    modal.querySelector('[data-confirm-payment]').href = `https://t.me/mmto1b?text=${encodeURIComponent(message)}`;
    modal.hidden = false;
    document.body.classList.add('tci-modal-open');
    modal.querySelector('.tci-payment-close').focus();
  };
  register.addEventListener('click', openModal);
  modal.querySelector('.tci-payment-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
  modal.querySelectorAll('[data-pay-tab]').forEach((tab) => tab.addEventListener('click', () => {
    modal.querySelectorAll('[data-pay-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
    modal.querySelectorAll('[data-pay-panel]').forEach((panel) => { panel.hidden = panel.dataset.payPanel !== tab.dataset.payTab; });
  }));
  modal.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try { await navigator.clipboard.writeText(value); }
    catch {
      const helper = document.createElement('textarea');
      helper.value = value; document.body.append(helper); helper.select(); document.execCommand('copy'); helper.remove();
    }
    const original = button.textContent; button.textContent = 'Đã chép'; setTimeout(() => { button.textContent = original; }, 1200);
  }));
})();
