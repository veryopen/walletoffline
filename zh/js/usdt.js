window.addEventListener("load", () => {
    document.getElementById('usdt_erc20_balance_btn').addEventListener('click', async (ev) => {
        const address = document.getElementById('usdt_erc20_address').value.trim();
        if (address) {
            const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            const balance = await usdt.balanceOf(wallet.address);
            document.getElementById('usdt_view_erc20_balance').innerHTML = ethers.formatUnits(balance, 6);
        }

    })
});