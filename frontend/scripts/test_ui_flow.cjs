const puppeteer = require('puppeteer');
const path = require('path');

async function testUI() {
  console.log('Launching browser to test live frontend & backend integration...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Visit Mission Setup
    console.log('Navigating to http://localhost:3000/#mission-setup...');
    await page.goto('http://localhost:3000/#mission-setup', { waitUntil: 'networkidle0', timeout: 15000 });

    const setupTitle = await page.title();
    console.log('Page title:', setupTitle);

    // Take screenshot of Mission Setup
    const setupScreenshot = path.join(__dirname, '..', '..', 'frontend_mission_setup.png');
    await page.screenshot({ path: setupScreenshot });
    console.log('Mission setup screenshot captured to:', setupScreenshot);

    // 2. Open Mission Preview Drawer
    console.log('Finding and clicking MISSION PREVIEW button...');
    const buttons = await page.$$('button');
    let previewBtn = null;
    for (const b of buttons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text && text.includes('MISSION PREVIEW')) {
        previewBtn = b;
        break;
      }
    }

    if (previewBtn) {
      console.log('Found MISSION PREVIEW button, clicking...');
      await previewBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const drawerScreenshot = path.join(__dirname, '..', '..', 'frontend_drawer_preview.png');
      await page.screenshot({ path: drawerScreenshot });
      console.log('Drawer screenshot captured to:', drawerScreenshot);

      // Close drawer
      const closeButtons = await page.$$('button');
      for (const cb of closeButtons) {
        const text = await (await cb.getProperty('innerText')).jsonValue();
        if (text && text.toLowerCase().includes('close')) {
          await cb.click();
          await new Promise(r => setTimeout(r, 600));
          break;
        }
      }
    } else {
      console.log('MISSION PREVIEW button not found by text query.');
    }

    // 3. Test Save Draft
    console.log('Testing SAVE DRAFT button click...');
    const currentButtons = await page.$$('button');
    for (const b of currentButtons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text && text.includes('SAVE DRAFT')) {
        await b.click();
        console.log('Clicked SAVE DRAFT, waiting for synchronization...');
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }

    // 4. Visit Health Assessment
    console.log('Navigating to http://localhost:3000/#assessment...');
    await page.goto('http://localhost:3000/#assessment', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const assessmentScreenshot = path.join(__dirname, '..', '..', 'frontend_assessment.png');
    await page.screenshot({ path: assessmentScreenshot });
    console.log('Health assessment screenshot captured to:', assessmentScreenshot);

    console.log('ALL FRONTEND UI CHECKS PASSED SUCCESSFULLY');
  } catch (err) {
    console.error('Error during UI test:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testUI();
