// Car Offers Application
class CarOffersApp {
    constructor() {
        this.offers = [];
        this.pendingOffers = [];
        this.filteredOffers = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupFilters();
        this.setupModal();
        this.setupPendingSection();
        this.renderPendingOffers();
        this.renderOffers();
    }

    async loadData() {
        try {
            const response = await fetch('data/offers.json');
            const data = await response.json();
            this.offers = data.offers;
            this.pendingOffers = data.pendingOffers || [];
            this.filteredOffers = [...this.offers];
            document.getElementById('last-updated').textContent = data.lastUpdated;
            this.populateMakerFilter();
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('offers-container').innerHTML = `
                <div class="no-results">
                    <h3>Eroare la incarcarea datelor</h3>
                    <p>Va rugam reincarcati pagina.</p>
                </div>
            `;
        }
    }

    setupPendingSection() {
        const toggle = document.getElementById('pending-toggle');
        const section = document.querySelector('.pending-section');

        if (toggle && section) {
            // Start expanded if there are pending offers
            if (this.pendingOffers.length > 0) {
                section.classList.add('expanded');
            }

            toggle.addEventListener('click', () => {
                section.classList.toggle('expanded');
            });
        }
    }

    renderPendingOffers() {
        const container = document.getElementById('pending-container');
        const countEl = document.getElementById('pending-count');

        if (!container) return;

        countEl.textContent = this.pendingOffers.length;

        if (this.pendingOffers.length === 0) {
            container.innerHTML = '<p class="no-pending">Nu exista oferte in asteptare.</p>';
            return;
        }

        container.innerHTML = this.pendingOffers.map(pending => `
            <a href="${pending.officialPageUrl || '#'}" target="_blank" class="pending-card${pending.officialPageUrl ? ' clickable' : ''}">
                <div class="pending-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                </div>
                <div class="pending-card-info">
                    <h3>${pending.maker} ${pending.model}</h3>
                    ${pending.version ? `<div class="version">${pending.version}</div>` : ''}
                    <div class="pending-card-status">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        ${pending.status}
                    </div>
                </div>
            </a>
        `).join('');
    }

    populateMakerFilter() {
        const makers = [...new Set(this.offers.map(o => o.maker))].sort();
        const select = document.getElementById('maker-filter');
        makers.forEach(maker => {
            const option = document.createElement('option');
            option.value = maker;
            option.textContent = maker;
            select.appendChild(option);
        });
    }

    setupFilters() {
        const filters = ['maker-filter', 'fuel-filter', 'payment-filter', 'sort-by'];
        filters.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.applyFilters());
        });
    }

    applyFilters() {
        const makerFilter = document.getElementById('maker-filter').value;
        const fuelFilter = document.getElementById('fuel-filter').value.toLowerCase();
        const paymentFilter = document.getElementById('payment-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        this.filteredOffers = this.offers.filter(offer => {
            // Maker filter
            if (makerFilter && offer.maker !== makerFilter) return false;

            // Fuel type filter
            if (fuelFilter) {
                const fuelType = offer.specs.fuelType.toLowerCase();
                if (fuelFilter === 'hybrid' && !fuelType.includes('hybrid')) return false;
                if (fuelFilter === 'full-hybrid' && !fuelType.includes('full hybrid')) return false;
                if (fuelFilter === 'mild-hybrid' && !fuelType.includes('mild hybrid')) return false;
                if (fuelFilter === 'benzina' && !fuelType.includes('benzina') && !fuelType.includes('hybrid')) return false;
                if (fuelFilter === 'diesel' && !fuelType.includes('diesel')) return false;
                if (fuelFilter === 'electric' && !fuelType.includes('electric') && fuelType.includes('hybrid')) return false;
            }

            // Payment type filter
            if (paymentFilter && offer.paymentType !== paymentFilter) return false;

            return true;
        });

        // Sort
        this.filteredOffers.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return (this.getComparablePrice(a) || Infinity) - (this.getComparablePrice(b) || Infinity);
                case 'price-desc':
                    return (this.getComparablePrice(b) || 0) - (this.getComparablePrice(a) || 0);
                case 'monthly-asc':
                    return (this.getMonthlyPayment(a) || Infinity) - (this.getMonthlyPayment(b) || Infinity);
                case 'monthly-desc':
                    return (this.getMonthlyPayment(b) || 0) - (this.getMonthlyPayment(a) || 0);
                case 'power-desc':
                    return this.extractPower(b) - this.extractPower(a);
                case 'maker-asc':
                    return a.maker.localeCompare(b.maker) || a.model.localeCompare(b.model);
                default:
                    return 0;
            }
        });

        this.renderOffers();
    }

    getComparablePrice(offer) {
        if (!offer.price.total) return null;
        // Convert to RON for comparison (approximate rate)
        if (offer.price.currency === 'EUR') {
            return offer.price.total * 5;
        }
        return offer.price.total;
    }

    getMonthlyPayment(offer) {
        if (!offer.financing) return null;
        return offer.financing.monthlyPayment;
    }

    extractPower(offer) {
        const power = offer.specs.enginePower;
        const match = power.match(/(\d+)\s*CP/i) || power.match(/(\d+)\s*kW/i);
        return match ? parseInt(match[1]) : 0;
    }

    renderOffers() {
        const container = document.getElementById('offers-container');

        if (this.filteredOffers.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Nu s-au gasit oferte</h3>
                    <p>Incercati sa modificati filtrele pentru a vedea mai multe oferte.</p>
                </div>
            `;
            return;
        }

        // Group by maker
        const groupedOffers = this.filteredOffers.reduce((acc, offer) => {
            if (!acc[offer.maker]) acc[offer.maker] = [];
            acc[offer.maker].push(offer);
            return acc;
        }, {});

        let html = '';
        Object.keys(groupedOffers).sort().forEach(maker => {
            const offers = groupedOffers[maker];
            html += `
                <div class="maker-group">
                    <div class="maker-header">
                        <h2>${maker}</h2>
                        <span class="maker-count">${offers.length} ${offers.length === 1 ? 'oferta' : 'oferte'}</span>
                    </div>
                    <div class="maker-offers">
                        ${offers.map(offer => this.renderCard(offer)).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click handlers to cards
        container.querySelectorAll('.car-card').forEach(card => {
            card.addEventListener('click', () => {
                const offerId = card.dataset.id;
                const offer = this.offers.find(o => o.id === offerId);
                if (offer) this.openModal(offer);
            });
        });
    }

    renderCard(offer) {
        const fuelClass = this.getFuelClass(offer.specs.fuelType);
        const priceDisplay = this.formatPrice(offer);
        const monthlyDisplay = offer.financing ? this.formatCurrency(offer.financing.monthlyPayment, offer.financing.monthlyPaymentCurrency || offer.price.currency) + '/luna' : '';

        return `
            <div class="car-card" data-id="${offer.id}">
                <div class="card-image">
                    ${offer.imageUrl ?
                        `<img src="${offer.imageUrl}" alt="${offer.maker} ${offer.model}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\\'></path></svg><span>${offer.maker} ${offer.model}</span></div>';">` :
                        `<div class="placeholder-image">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                            <span>${offer.maker} ${offer.model}</span>
                        </div>`
                    }
                    <span class="fuel-badge ${fuelClass}">${this.formatFuelType(offer.specs.fuelType)}</span>
                    <span class="payment-badge">${this.formatPaymentType(offer.paymentType)}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${offer.maker} ${offer.model}</h3>
                    <p class="card-version">${offer.version}</p>
                    <div class="card-specs">
                        <span class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            ${offer.specs.enginePower}
                        </span>
                        <span class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z"/>
                            </svg>
                            ${offer.specs.consumption}
                        </span>
                        <span class="spec-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-2H3v2zm3.5-8.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            ${offer.specs.transmission}
                        </span>
                    </div>
                    <div class="card-price-section">
                        ${priceDisplay ? `
                            <div class="price-row">
                                <span class="price-label">Pret total</span>
                                <span class="price-value main-price">${priceDisplay}</span>
                            </div>
                        ` : ''}
                        ${monthlyDisplay ? `
                            <div class="price-row">
                                <span class="price-label">Rata lunara</span>
                                <span class="price-value monthly">${monthlyDisplay}</span>
                            </div>
                        ` : ''}
                        ${offer.financing && offer.financing.downPayment ? `
                            <div class="price-row">
                                <span class="price-label">Avans</span>
                                <span class="price-value">${this.formatCurrency(offer.financing.downPayment, offer.financing.monthlyPaymentCurrency || offer.price.currency)}</span>
                            </div>
                        ` : ''}
                        ${offer.financing && offer.financing.duration ? `
                            <div class="price-row">
                                <span class="price-label">Durata</span>
                                <span class="price-value">${offer.financing.duration} luni</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="dealership-info">${offer.dealership}</span>
                        <button class="view-details-btn">Detalii</button>
                    </div>
                </div>
            </div>
        `;
    }

    getFuelClass(fuelType) {
        const type = fuelType.toLowerCase();
        if (type.includes('electric') && !type.includes('hybrid')) return 'electric';
        if (type.includes('hybrid')) return 'hybrid';
        if (type.includes('diesel')) return 'diesel';
        return 'benzina';
    }

    formatFuelType(fuelType) {
        const type = fuelType.toLowerCase();
        if (type.includes('full hybrid')) return 'Full Hybrid';
        if (type.includes('mild hybrid')) return 'Mild Hybrid';
        if (type.includes('hybrid')) return 'Hybrid';
        if (type.includes('electric')) return 'Electric';
        if (type.includes('diesel')) return 'Diesel';
        return 'Benzina';
    }

    formatPaymentType(type) {
        const types = {
            'cash': 'Cash',
            'credit': 'Credit',
            'leasing': 'Leasing'
        };
        return types[type] || type;
    }

    formatPrice(offer) {
        if (!offer.price.total) return null;
        return this.formatCurrency(offer.price.total, offer.price.currency);
    }

    formatCurrency(amount, currency) {
        if (!amount) return '-';
        const formatted = new Intl.NumberFormat('ro-RO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
        return `${formatted} ${currency}`;
    }

    setupModal() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    openModal(offer) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = this.renderModalContent(offer);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    renderModalContent(offer) {
        const fuelClass = this.getFuelClass(offer.specs.fuelType);

        return `
            <div class="modal-header">
                <div class="modal-image">
                    ${offer.imageUrl ?
                        `<img src="${offer.imageUrl}" alt="${offer.maker} ${offer.model}">` :
                        `<div class="placeholder-image">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:80px;height:80px">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="modal-title-section">
                    <h2>${offer.maker} ${offer.model}</h2>
                    <p class="version">${offer.version}</p>
                    <div class="modal-badges">
                        <span class="fuel-badge ${fuelClass}">${this.formatFuelType(offer.specs.fuelType)}</span>
                        <span class="payment-badge">${this.formatPaymentType(offer.paymentType)}</span>
                    </div>
                    <div class="modal-price-info">
                        ${offer.price.total ? `
                            <div class="price-main">
                                ${this.formatCurrency(offer.price.total, offer.price.currency)}
                                ${offer.price.discount ? `<span class="discount-badge">-${this.formatCurrency(offer.price.discount, offer.price.currency)}</span>` : ''}
                            </div>
                        ` : '<div class="price-main">Pret la cerere</div>'}
                        ${offer.financing && offer.financing.monthlyPayment ? `
                            <div class="price-details">
                                Rata lunara: <strong>${this.formatCurrency(offer.financing.monthlyPayment, offer.financing.monthlyPaymentCurrency || offer.price.currency)}</strong>
                                ${offer.financing.duration ? ` x ${offer.financing.duration} luni` : ''}
                            </div>
                        ` : ''}
                    </div>
                    ${offer.officialPageUrl ? `
                        <a href="${offer.officialPageUrl}" target="_blank" class="official-link">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                            </svg>
                            Vezi pagina oficiala ${offer.maker}
                        </a>
                    ` : ''}
                </div>
            </div>

            <div class="modal-section">
                <h3>Informatii dealer</h3>
                <div class="specs-grid">
                    <div class="spec-card">
                        <div class="label">Dealer</div>
                        <div class="value">${offer.dealership}</div>
                    </div>
                    ${offer.dealerContact ? `
                        <div class="spec-card">
                            <div class="label">Contact</div>
                            <div class="value">${offer.dealerContact}</div>
                        </div>
                    ` : ''}
                    <div class="spec-card">
                        <div class="label">Data ofertei</div>
                        <div class="value">${offer.offerDate}</div>
                    </div>
                    ${offer.offerValidUntil ? `
                        <div class="spec-card">
                            <div class="label">Valabila pana la</div>
                            <div class="value">${offer.offerValidUntil}</div>
                        </div>
                    ` : ''}
                    <div class="spec-card">
                        <div class="label">ID Oferta</div>
                        <div class="value">${offer.offerId}</div>
                    </div>
                </div>
            </div>

            ${offer.financing ? `
                <div class="modal-section">
                    <h3>Detalii finantare - ${offer.financing.type || 'Credit'}</h3>
                    <div class="financing-grid">
                        ${offer.financing.downPayment ? `
                            <div class="financing-card">
                                <div class="value">${this.formatCurrency(offer.financing.downPayment, offer.price.currency)}</div>
                                <div class="label">Avans</div>
                            </div>
                        ` : ''}
                        ${offer.financing.monthlyPayment ? `
                            <div class="financing-card">
                                <div class="value">${this.formatCurrency(offer.financing.monthlyPayment, offer.financing.monthlyPaymentCurrency || offer.price.currency)}</div>
                                <div class="label">Rata lunara</div>
                            </div>
                        ` : ''}
                        ${offer.financing.duration ? `
                            <div class="financing-card">
                                <div class="value">${offer.financing.duration}</div>
                                <div class="label">Luni</div>
                            </div>
                        ` : ''}
                        ${offer.financing.interestRate ? `
                            <div class="financing-card">
                                <div class="value">${offer.financing.interestRate}%</div>
                                <div class="label">Dobanda fixa</div>
                            </div>
                        ` : ''}
                        ${offer.financing.effectiveInterestRate ? `
                            <div class="financing-card">
                                <div class="value">${offer.financing.effectiveInterestRate}%</div>
                                <div class="label">DAE</div>
                            </div>
                        ` : ''}
                        ${offer.financing.totalAmount ? `
                            <div class="financing-card">
                                <div class="value">${this.formatCurrency(offer.financing.totalAmount, offer.price.currency)}</div>
                                <div class="label">Total de plata</div>
                            </div>
                        ` : ''}
                        ${offer.financing.creditValue ? `
                            <div class="financing-card">
                                <div class="value">${this.formatCurrency(offer.financing.creditValue, offer.price.currency)}</div>
                                <div class="label">Valoare credit</div>
                            </div>
                        ` : ''}
                    </div>
                    ${offer.financing.fees && Object.keys(offer.financing.fees).length > 0 ? `
                        <div style="margin-top: 1rem;">
                            <h4 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Comisioane:</h4>
                            <div class="specs-grid">
                                ${offer.financing.fees.dosarAnalysis ? `
                                    <div class="spec-card">
                                        <div class="label">Analiza dosar</div>
                                        <div class="value">${this.formatCurrency(offer.financing.fees.dosarAnalysis, offer.price.currency)}</div>
                                    </div>
                                ` : ''}
                                ${offer.financing.fees.monthlyAdmin ? `
                                    <div class="spec-card">
                                        <div class="label">Administrare lunara</div>
                                        <div class="value">${this.formatCurrency(offer.financing.fees.monthlyAdmin, offer.price.currency)}</div>
                                    </div>
                                ` : ''}
                                ${offer.financing.fees.insurance ? `
                                    <div class="spec-card">
                                        <div class="label">Asigurare lunara</div>
                                        <div class="value">${this.formatCurrency(offer.financing.fees.insurance, offer.price.currency)}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <div class="modal-section">
                <h3>Servicii si asigurari</h3>
                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-icon ${offer.services.servicePackage ? 'active' : 'inactive'}">
                            ${offer.services.servicePackage ? '&#10003;' : '&#10005;'}
                        </div>
                        <div class="service-info">
                            <div class="name">Pachet service</div>
                            <div class="details">${offer.services.servicePackageDetails || (offer.services.servicePackage ? 'Inclus' : 'Nu este inclus')}</div>
                        </div>
                    </div>
                    <div class="service-card">
                        <div class="service-icon ${offer.services.extendedWarranty ? 'active' : 'inactive'}">
                            ${offer.services.extendedWarranty ? '&#10003;' : '&#10005;'}
                        </div>
                        <div class="service-info">
                            <div class="name">Garantie extinsa</div>
                            <div class="details">${offer.services.extendedWarrantyDetails || (offer.services.extendedWarranty ? 'Inclus' : 'Nu este inclus')}</div>
                        </div>
                    </div>
                    <div class="service-card">
                        <div class="service-icon ${offer.services.trafficAccidentInsurance ? 'active' : 'inactive'}">
                            ${offer.services.trafficAccidentInsurance ? '&#10003;' : '&#10005;'}
                        </div>
                        <div class="service-info">
                            <div class="name">Asigurare accident</div>
                            <div class="details">${offer.services.trafficAccidentInsurance ? 'Inclus' : 'Nu este inclus'}</div>
                        </div>
                    </div>
                    <div class="service-card">
                        <div class="service-icon ${offer.services.cascoInsurance ? 'active' : 'inactive'}">
                            ${offer.services.cascoInsurance ? '&#10003;' : '&#10005;'}
                        </div>
                        <div class="service-info">
                            <div class="name">Asigurare CASCO</div>
                            <div class="details">${offer.services.cascoInsurance ? 'Inclus' : 'Nu este inclus'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h3>Specificatii tehnice</h3>
                <div class="specs-grid">
                    <div class="spec-card">
                        <div class="label">Combustibil</div>
                        <div class="value">${offer.specs.fuelType}</div>
                    </div>
                    <div class="spec-card">
                        <div class="label">Putere</div>
                        <div class="value">${offer.specs.enginePower}</div>
                    </div>
                    <div class="spec-card">
                        <div class="label">Cilindree</div>
                        <div class="value">${offer.specs.engineDisplacement} cc</div>
                    </div>
                    ${offer.specs.torque ? `
                        <div class="spec-card">
                            <div class="label">Cuplu</div>
                            <div class="value">${offer.specs.torque}</div>
                        </div>
                    ` : ''}
                    <div class="spec-card">
                        <div class="label">Transmisie</div>
                        <div class="value">${offer.specs.transmission}</div>
                    </div>
                    ${offer.specs.drivetrain ? `
                        <div class="spec-card">
                            <div class="label">Tractiune</div>
                            <div class="value">${offer.specs.drivetrain}</div>
                        </div>
                    ` : ''}
                    <div class="spec-card">
                        <div class="label">Consum</div>
                        <div class="value">${offer.specs.consumption}</div>
                    </div>
                    <div class="spec-card">
                        <div class="label">Emisii CO2</div>
                        <div class="value">${offer.specs.emissions}</div>
                    </div>
                    ${offer.specs.maxSpeed ? `
                        <div class="spec-card">
                            <div class="label">Viteza maxima</div>
                            <div class="value">${offer.specs.maxSpeed}</div>
                        </div>
                    ` : ''}
                    ${offer.specs.acceleration ? `
                        <div class="spec-card">
                            <div class="label">Acceleratie 0-100</div>
                            <div class="value">${offer.specs.acceleration}</div>
                        </div>
                    ` : ''}
                    <div class="spec-card">
                        <div class="label">Tip caroserie</div>
                        <div class="value">${offer.specs.bodyType}</div>
                    </div>
                    <div class="spec-card">
                        <div class="label">Numar usi</div>
                        <div class="value">${offer.specs.doors}</div>
                    </div>
                    <div class="spec-card">
                        <div class="label">Numar locuri</div>
                        <div class="value">${offer.specs.seats}</div>
                    </div>
                    ${offer.specs.tankCapacity ? `
                        <div class="spec-card">
                            <div class="label">Rezervor</div>
                            <div class="value">${offer.specs.tankCapacity} L</div>
                        </div>
                    ` : ''}
                    ${offer.specs.trunkCapacity ? `
                        <div class="spec-card">
                            <div class="label">Portbagaj</div>
                            <div class="value">${offer.specs.trunkCapacity} L</div>
                        </div>
                    ` : ''}
                    ${offer.specs.tires ? `
                        <div class="spec-card">
                            <div class="label">Anvelope</div>
                            <div class="value">${offer.specs.tires}</div>
                        </div>
                    ` : ''}
                    ${offer.specs.color ? `
                        <div class="spec-card">
                            <div class="label">Culoare</div>
                            <div class="value">${offer.specs.color}</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${offer.specs.dimensions ? `
                <div class="modal-section">
                    <h3>Dimensiuni</h3>
                    <div class="specs-grid">
                        ${offer.specs.dimensions.length ? `
                            <div class="spec-card">
                                <div class="label">Lungime</div>
                                <div class="value">${offer.specs.dimensions.length} mm</div>
                            </div>
                        ` : ''}
                        ${offer.specs.dimensions.width ? `
                            <div class="spec-card">
                                <div class="label">Latime</div>
                                <div class="value">${offer.specs.dimensions.width} mm</div>
                            </div>
                        ` : ''}
                        ${offer.specs.dimensions.height ? `
                            <div class="spec-card">
                                <div class="label">Inaltime</div>
                                <div class="value">${offer.specs.dimensions.height} mm</div>
                            </div>
                        ` : ''}
                        ${offer.specs.dimensions.wheelbase ? `
                            <div class="spec-card">
                                <div class="label">Ampatament</div>
                                <div class="value">${offer.specs.dimensions.wheelbase} mm</div>
                            </div>
                        ` : ''}
                        ${offer.specs.dimensions.groundClearance ? `
                            <div class="spec-card">
                                <div class="label">Garda la sol</div>
                                <div class="value">${offer.specs.dimensions.groundClearance} mm</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${offer.specs.weight ? `
                <div class="modal-section">
                    <h3>Greutati</h3>
                    <div class="specs-grid">
                        ${offer.specs.weight.curb ? `
                            <div class="spec-card">
                                <div class="label">Masa proprie</div>
                                <div class="value">${offer.specs.weight.curb}</div>
                            </div>
                        ` : ''}
                        ${offer.specs.weight.maxAuthorized ? `
                            <div class="spec-card">
                                <div class="label">Masa maxima autorizata</div>
                                <div class="value">${offer.specs.weight.maxAuthorized} kg</div>
                            </div>
                        ` : ''}
                        ${offer.specs.weight.towingBraked ? `
                            <div class="spec-card">
                                <div class="label">Remorcabil cu franare</div>
                                <div class="value">${offer.specs.weight.towingBraked} kg</div>
                            </div>
                        ` : ''}
                        ${offer.specs.weight.towingUnbraked ? `
                            <div class="spec-card">
                                <div class="label">Remorcabil fara franare</div>
                                <div class="value">${offer.specs.weight.towingUnbraked} kg</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${offer.features && Object.keys(offer.features).length > 0 ? `
                <div class="modal-section">
                    <h3>Dotari complete</h3>
                    ${Object.entries(offer.features).map(([category, items]) => `
                        <div class="feature-category">
                            <h4>${this.formatCategoryName(category)}</h4>
                            <div class="feature-items">
                                ${items.map(item => `<span class="feature-item">${item}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${offer.accessories && offer.accessories.length > 0 ? `
                <div class="modal-section">
                    <h3>Accesorii incluse</h3>
                    <div class="feature-items">
                        ${offer.accessories.map(item => `<span class="feature-item">${item}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    formatCategoryName(category) {
        const names = {
            'safety': 'Siguranta',
            'design': 'Design',
            'comfort': 'Confort',
            'multimedia': 'Multimedia'
        };
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CarOffersApp();
});
