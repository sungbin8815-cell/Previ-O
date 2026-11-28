// Start screen → a blank project, in 간편 or 프로 mode; the tutorial bubble is closed with Esc.
exports.blank = async (p, pro) => { await p.getByText(pro ? '프로' : '간편 모드', { exact: true }).click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: /^새 프로젝트/ }).click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: /^빈 프로젝트/ }).click(); await p.waitForTimeout(1500);
  for (let i = 0; i < 4; i++) { const v = await p.evaluate(() => { const c = document.getElementById('coach'); return c && !c.hidden; }); if (!v) break; await p.keyboard.press('Escape'); await p.waitForTimeout(300); } };
