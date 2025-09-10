import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Try clicking the retry button to see if the menu loads or if the error persists.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Try to open the admin panel on desktop screen to verify its layout and functionality.
        await page.goto('http://localhost:3000/admin', timeout=10000)
        

        # Resize viewport to tablet screen size and verify UI components rearrange responsively with no overlap or clipping.
        await page.goto('http://localhost:3000/admin/login', timeout=10000)
        

        # Resize viewport to tablet screen size and verify UI components rearrange responsively with no overlap or clipping.
        await page.goto('http://localhost:3000/admin/login', timeout=10000)
        

        await page.mouse.wheel(0, window.innerHeight)
        

        # Assert the page title is correct
        assert await page.title() == 'Pizzaria Digital'
        # Assert the admin panel section header is visible and correct
        section_header = page.locator('text=Painel Administrativo')
        assert await section_header.is_visible()
        # Assert the email and password input fields are present
        email_input = page.locator('input[name="Email"]')
        password_input = page.locator('input[name="Senha"]')
        assert await email_input.is_visible()
        assert await password_input.is_visible()
        # Assert the buttons 'Entrar' and 'Testar Conexão' are visible
        entrar_button = page.locator('button', has_text='Entrar')
        testar_conexao_button = page.locator('button', has_text='Testar Conexão')
        assert await entrar_button.is_visible()
        assert await testar_conexao_button.is_visible()
        # Assert the description text is present
        description_text = page.locator('text=Sistema de gerenciamento de cardápio digital')
        assert await description_text.is_visible()
        # Assert the status text is present
        status_text = page.locator('text=Sistema configurado')
        assert await status_text.is_visible()
        # Responsive checks: Verify layout and components render correctly on desktop
        viewport = page.viewport_size
        assert viewport['width'] >= 1024  # Desktop width
        # Resize to tablet size and verify UI components rearrange without overlap or clipping
        await page.set_viewport_size({'width': 768, 'height': 1024})
        # Check that key elements are still visible and usable on tablet
        assert await section_header.is_visible()
        assert await email_input.is_visible()
        assert await password_input.is_visible()
        assert await entrar_button.is_visible()
        assert await testar_conexao_button.is_visible()
        # Resize to mobile size and verify UI components rearrange without overlap or clipping
        await page.set_viewport_size({'width': 375, 'height': 667})
        # Check that key elements are still visible and usable on mobile
        assert await section_header.is_visible()
        assert await email_input.is_visible()
        assert await password_input.is_visible()
        assert await entrar_button.is_visible()
        assert await testar_conexao_button.is_visible()
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    