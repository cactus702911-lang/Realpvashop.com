function initUI() {
    // 1. Path Management (Simplified with root-relative paths)
    const paths = (window.siteConfig && window.siteConfig.pathConfig) ? window.siteConfig.pathConfig : {
        product: 'product',
        category: 'category',
        blog: 'blog'
    };

    const mobileMenuBtn = document.getElementById('mobile-menu-btn'),
          mobileMenu = document.getElementById('mobile-menu'),
          mobileBackdrop = document.getElementById('mobile-menu-backdrop'),
          menuOpenIcon = document.getElementById('menu-open-icon'),
          menuCloseIcon = document.getElementById('menu-close-icon'),
          searchInput = document.getElementById('search-services'),
          categorySelect = document.getElementById('category-select'),
          productGrid = document.getElementById('product-grid');

    // 2. Filter Products (Optimized)
    function filterProducts() {
        if (!productGrid) return;
        const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const selectedCategory = (categorySelect ? categorySelect.value : 'All Categories');
        const cards = productGrid.querySelectorAll('.card-glow');
        
        // Use document fragment for better performance if we were adding/removing, 
        // but here we just toggle display. Still, we can minimize reflows.
        productGrid.style.display = 'none'; 
        
        let visibleCount = 0;
        cards.forEach(card => {
            const title = card.querySelector('h3, .font-bold.text-slate-100')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.text-cyan-400')?.textContent || '';
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = selectedCategory === 'All Categories' || category === selectedCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        productGrid.style.display = '';

        let noResults = document.getElementById('no-results-message');
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.id = 'no-results-message';
                noResults.className = 'col-span-full py-20 text-center';
                noResults.innerHTML = `
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <i data-lucide="search-x" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p class="text-gray-500">Try adjusting your search or category filter</p>
                `;
                productGrid.appendChild(noResults);
                if (window.lucide) window.lucide.createIcons();
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    // Debounce search for better performance
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterProducts, 150);
        }, { passive: true });
    }
    if (categorySelect) categorySelect.addEventListener('change', filterProducts, { passive: true });

    // 3. Popup & Mobile Menu Logic (Streamlined)
    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        if (mobileBackdrop) mobileBackdrop.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
    window.closeMobileMenu = closeMobileMenu;

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
                if (mobileBackdrop) {
                    mobileBackdrop.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
                    mobileBackdrop.classList.add('opacity-100');
                }
                if (menuOpenIcon) menuOpenIcon.classList.add('hidden');
                if (menuCloseIcon) menuCloseIcon.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
            } else closeMobileMenu();
        }, { passive: true });
    }

    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu, { passive: true });

    document.querySelectorAll('.mobile-cat-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = toggle.getAttribute('data-cat');
            const items = document.getElementById(`mobile-items-${cat}`);
            const icon = toggle.querySelector('i');
            if (items) {
                const isHidden = items.classList.toggle('hidden');
                if (icon) icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }, { passive: true });
    });

    window.openPopup = function() {
        const popup = document.getElementById('contact-popup');
        const popupBackdrop = document.getElementById('popup-backdrop');
        const popupPanel = document.getElementById('popup-panel');
        if (!popup) return;
        
        popup.classList.remove('hidden');
        setTimeout(() => {
            if (popupBackdrop) popupBackdrop.classList.remove('opacity-0', 'pointer-events-none');
            if (popupPanel) popupPanel.classList.remove('opacity-0', 'scale-95');
        }, 10);
        document.body.classList.add('overflow-hidden');
    };

    window.closePopup = function() {
        const popup = document.getElementById('contact-popup');
        const popupBackdrop = document.getElementById('popup-backdrop');
        const popupPanel = document.getElementById('popup-panel');
        if (!popup) return;
        
        if (popupBackdrop) popupBackdrop.classList.add('opacity-0', 'pointer-events-none');
        if (popupPanel) popupPanel.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            popup.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    };

    // 4. Tab Switching Logic (Robust & Independent)
    function handleTabSwitching() {
        // Use event delegation on the document for maximum robustness
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('[id^="tab-btn-"]');
            if (!tabBtn) return;

            const tabId = tabBtn.id.replace('tab-btn-', '');
            const tabContainer = tabBtn.closest('.mt-12'); // The tab wrapper
            if (!tabContainer) return;

            const allBtns = tabContainer.querySelectorAll('[id^="tab-btn-"]');
            const allTabs = tabContainer.querySelectorAll('[id^="tab-"]');

            const activeClass = "px-4 md:px-8 py-3 bg-gray-100/50 text-cyan-600 font-bold rounded-t-lg border-t border-x border-gray-200 text-sm relative top-[1px] transition-all";
            const inactiveClass = "px-4 md:px-8 py-3 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors";

            // Update Tabs
            allTabs.forEach(tab => {
                // Ensure we are only targeting the actual tab content divs, not the buttons
                if (tab.id === `tab-${tabId}`) {
                    tab.classList.remove('hidden');
                } else if (tab.id.startsWith('tab-') && !tab.id.includes('btn')) {
                    tab.classList.add('hidden');
                }
            });

            // Update Buttons
            allBtns.forEach(btn => {
                if (btn.id === `tab-btn-${tabId}`) btn.className = activeClass;
                else btn.className = inactiveClass;
            });

            if (window.lucide) window.lucide.createIcons();
        });
    }
    handleTabSwitching();

    // 5. Dynamic Hydration Logic (Ensures site_data.js updates reflect immediately)
    function hydratePage() {
        const hasRuntimeData =
            Array.isArray(window.products) ||
            Array.isArray(window.categories) ||
            (window.siteConfig && typeof window.siteConfig === 'object');
        if (!hasRuntimeData) return;

        const urlParams = new URLSearchParams(window.location.search);
        const dynamicProductPath = urlParams.get('p');
        const dynamicCategoryPath = urlParams.get('c');
        const path = dynamicProductPath || dynamicCategoryPath || window.location.pathname;
        
        const siteConfig = window.siteConfig || {};
        const paths = siteConfig.pathConfig || { product: 'product', category: 'category', blog: 'blog' };
        
        // If we came from 404 redirect, we might need to show a special UI or just hydrate the home
        if (dynamicProductPath || dynamicCategoryPath) {
            // Reserved for dynamic-route fallback handling.
        }

        // Helper: Find item by slug in a list
        const findBySlug = (list, slug) => list ? list.find(item => item.slug === slug) : null;
        const getOverlayTitle = (product) => {
            const displayTitle = product && typeof product.display_title === 'string' ? product.display_title.trim() : '';
            if (displayTitle) return displayTitle;
            const title = product && typeof product.title === 'string' ? product.title : '';
            return title.replace(/^Buy\s+/i, '');
        };

        // 5a. Product Page Hydration
        if (path.includes(`/${paths.product}/`)) {
            const slugPart = path.split(`/${paths.product}/`)[1];
            if (!slugPart) return;
            const slug = slugPart.replace(/\/+$/, '');
            const product = findBySlug(window.products, slug);
            if (product) {
                const titleEl = document.getElementById('detail-title') || document.querySelector('h1');
                const priceEl = document.getElementById('detail-price');
                const descEl = document.getElementById('detail-desc') || document.getElementById('long-desc');
                
                if (titleEl) titleEl.textContent = product.title;
                if (priceEl) priceEl.textContent = `$${product.min_price.toFixed(2)} - $${product.max_price.toFixed(2)}`;
                
                const shortDescEl = document.getElementById('detail-desc');
                if (shortDescEl) shortDescEl.textContent = product.short_description || product.description;

                // Update reviews count if elements exist
                const reviewCountBadge = document.getElementById('review-count-badge');
                if (reviewCountBadge && window.reviewsData) {
                    const count = window.reviewsData.filter(r => r.productId === product.id).length;
                    reviewCountBadge.textContent = count;
                }
            }
        }
        
        // 5b. Category Page Hydration
        else if (path.includes(`/${paths.category}/`)) {
            const slugPart = path.split(`/${paths.category}/`)[1];
            if (!slugPart) return;
            const slug = slugPart.replace(/\/+$/, '');
            const category = findBySlug(window.categories, slug);
            if (category) {
                const titleEl = document.querySelector('h1');
                if (titleEl) titleEl.textContent = category.name;
            }
        }

        // 5c. Global Elements (Header/Footer Links)
        // We can update the navigation links to use the latest slugs from paths
        document.querySelectorAll('a[data-type]').forEach(link => {
            const type = link.getAttribute('data-type');
            const slug = link.getAttribute('data-slug');
            if (type && paths[type]) {
                const newUrl = (type === 'home') ? '/' : `/${paths[type]}/${slug || ''}/`.replace(/\/+/g, '/');
                link.href = newUrl;
            }
        });

        // 5d. Product Grid Updates (for Home/Category pages)
        if (document.getElementById('product-grid') && window.products) {
            const cards = document.querySelectorAll('.card-glow');
            cards.forEach(card => {
                const cardLink = card.querySelector('a');
                if (!cardLink) return;
                
                // Extract slug from card link
                const href = cardLink.getAttribute('href');
                const slugPart = href.split(`/${paths.product}/`)[1];
                if (!slugPart) return;
                const slug = slugPart.replace(/\/+$/, '');
                
                const product = findBySlug(window.products, slug);
                if (product) {
                    // Check Active Status
                    if (product.active === false) {
                        card.style.display = 'none';
                        return;
                    }

                    // Update Title
                    const titleEl = card.querySelector('h3, .font-bold.text-slate-100');
                    if (titleEl) titleEl.textContent = getOverlayTitle(product);
                    
                    // Update Price
                    const priceEl = card.querySelector('.text-xl.font-black.text-white');
                    if (priceEl) priceEl.textContent = `$${product.min_price.toFixed(2)}`;
                }
            });
        }
    }
    hydratePage();

    // 5. Floating WhatsApp Button
    function initFloatingWhatsApp() {
        if (document.getElementById('floating-whatsapp')) return;

        const whatsappNumberRaw = (window.siteConfig && window.siteConfig.whatsapp) ? window.siteConfig.whatsapp : '+15485801949';
        const whatsappNumber = whatsappNumberRaw.replace(/\D/g, '');

        const a = document.createElement('a');
        a.id = 'floating-whatsapp';
        a.href = '#';
        a.className = 'fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-green-500/30 hover:bg-[#20ba5a] hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 group';
        a.setAttribute('aria-label', 'Chat on WhatsApp');
        
        a.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12.01 2.014c-5.46 0-9.89 4.43-9.89 9.89 0 1.74.45 3.39 1.31 4.86L2 22l5.44-1.42c1.42.82 3.04 1.25 4.57 1.25 5.46 0 9.89-4.43 9.89-9.89 0-5.46-4.43-9.89-9.89-9.89zm0 17.9c-1.46 0-2.88-.39-4.14-1.14l-.3-.18-3.08.8.82-3-.2-.31c-.81-1.28-1.24-2.75-1.24-4.28 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.09-8.09 8.09zm4.44-6.07c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.21-.72-.65-1.21-1.45-1.35-1.7-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.57.18 1.09.16 1.5.1.45-.07 1.43-.58 1.63-1.14.2-.56.2-.1.14-.11z"/>
            </svg>
            <span class="absolute right-16 bg-white text-slate-800 text-sm font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                Chat with us
            </span>
        `;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            let message = '';
            
            const productTitleEl = document.getElementById('detail-title');
            if (productTitleEl) {
                const productName = productTitleEl.innerText.trim();
                let price = 'N/A';
                const pricingOptions = document.getElementById('pricing-options');
                const detailPriceEl = document.getElementById('detail-price');
                
                if (pricingOptions && pricingOptions.options.length > 0) {
                    price = pricingOptions.options[pricingOptions.selectedIndex].text.trim();
                } else if (detailPriceEl) {
                    price = detailPriceEl.innerText.trim();
                }
                
                // Adding a fallback SKU to match the user request, although not present in DOM
                message = `Product: ${productName}\nSKU: N/A\nPrice: ${price}\n\nHi, I am interested in this product.`;
            }

            let whatsappUrl = `https://wa.me/${whatsappNumber}`;
            if (message) {
                whatsappUrl += `?text=${encodeURIComponent(message)}`;
            }

            window.open(whatsappUrl, '_blank');
        });

        document.body.appendChild(a);
    }
    initFloatingWhatsApp();

    // 6. Hydration Logic (Lucide Icons)
    function initIcons() {
        if (!document.querySelector('[data-lucide]')) return;
        if (!window.lucide || typeof window.lucide.createIcons !== 'function') return;
        window.lucide.createIcons();
    }
    initIcons();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI);
else initUI();
