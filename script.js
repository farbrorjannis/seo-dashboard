// Set today's date as default
document.getElementById('checkDate').valueAsDate = new Date();

// Get all inputs
const inputs = document.querySelectorAll('input[type="number"]');

// Add event listeners to all inputs
inputs.forEach(input => {
    input.addEventListener('input', function() {
        // Update progress bar for this input
        const progressId = 'progress_' + this.id;
        const progressBar = document.getElementById(progressId);
        if (progressBar) {
            const value = parseFloat(this.value) || 0;
            progressBar.style.width = value + '%';
        }
        
        // Recalculate all scores
        calculateScores();
    });
});

function calculateScores() {
    // Calculate category scores
    const categories = {
        tech: { max: 20, current: 0 },
        content: { max: 25, current: 0 },
        backlink: { max: 20, current: 0 },
        ux: { max: 15, current: 0 },
        schema: { max: 10, current: 0 },
        crawl: { max: 10, current: 0 }
    };
    
    inputs.forEach(input => {
        const category = input.dataset.category;
        const weight = parseFloat(input.dataset.weight);
        const value = parseFloat(input.value) || 0;
        const score = (value / 100) * weight;
        categories[category].current += score;
    });
    
    // Update category displays
    document.getElementById('techScore').textContent = 
        `${categories.tech.current.toFixed(1)}/${categories.tech.max}`;
    document.getElementById('contentScore').textContent = 
        `${categories.content.current.toFixed(1)}/${categories.content.max}`;
    document.getElementById('backlinkScore').textContent = 
        `${categories.backlink.current.toFixed(1)}/${categories.backlink.max}`;
    document.getElementById('uxScore').textContent = 
        `${categories.ux.current.toFixed(1)}/${categories.ux.max}`;
    document.getElementById('schemaScore').textContent = 
        `${categories.schema.current.toFixed(1)}/${categories.schema.max}`;
    document.getElementById('crawlScore').textContent = 
        `${categories.crawl.current.toFixed(1)}/${categories.crawl.max}`;
    
    // Calculate overall score
    const overall = Object.values(categories).reduce((sum, cat) => sum + cat.current, 0);
    document.getElementById('overallScore').textContent = overall.toFixed(0);
    
    // Show recommendations
    showRecommendations(categories);
}

function showRecommendations(categories) {
    const recommendations = [];
    
    if (categories.tech.current < 15) {
        recommendations.push('Improve Technical SEO: Increase page speed, optimize images, fix mobile responsiveness');
    }
    if (categories.content.current < 18) {
        recommendations.push('Improve Content: Ensure all pages have unique meta titles and descriptions');
    }
    if (categories.backlink.current < 10) {
        recommendations.push('Build more Backlinks: Guest posts, partnerships, social media');
    }
    if (categories.ux.current < 10) {
        recommendations.push('Improve User Experience: Optimize Core Web Vitals, simplify navigation');
    }
    if (categories.schema.current < 5) {
        recommendations.push('Add Schema Markup: Use structured data for better search results');
    }
    if (categories.crawl.current < 7) {
        recommendations.push('Fix Crawling Issues: Check robots.txt, create/update XML sitemap');
    }
    
    const recBox = document.getElementById('recommendations');
    const recList = document.getElementById('recommendationList');
    
    if (recommendations.length > 0) {
        recBox.style.display = 'block';
        recList.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
    } else {
        recBox.style.display = 'none';
    }
}

function saveScore() {
    const date = document.getElementById('checkDate').value;
    if (!date) {
        alert('Please select a date first!');
        return;
    }
    
    const data = {
        date: date,
        overall: parseFloat(document.getElementById('overallScore').textContent),
        scores: {}
    };
    
    inputs.forEach(input => {
        data.scores[input.id] = parseFloat(input.value) || 0;
    });
    
    // Get existing history
    let history = JSON.parse(localStorage.getItem('seoHistory') || '[]');
    
    // Check if date already exists
    const existingIndex = history.findIndex(item => item.date === date);
    if (existingIndex >= 0) {
        if (confirm('A measurement already exists for this date. Replace it?')) {
            history[existingIndex] = data;
        } else {
            return;
        }
    } else {
        history.push(data);
    }
    
    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    localStorage.setItem('seoHistory', JSON.stringify(history));
    
    alert('✅ Measurement saved!');
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('seoHistory') || '[]');
    const container = document.getElementById('historyList');
    
    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No history yet. Fill in measurements and click "Save".</p>';
        return;
    }
    
    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-date">${new Date(item.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.overall}%"></div>
                </div>
                <div class="history-score">${item.overall}</div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn-secondary" style="flex: 1; padding: 10px; margin: 0;" onclick="loadScore(${index})">Load</button>
                <button class="btn-danger" style="flex: 1; padding: 10px; margin: 0;" onclick="deleteScore(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

function loadScore(index) {
    const history = JSON.parse(localStorage.getItem('seoHistory') || '[]');
    const data = history[index];
    
    document.getElementById('checkDate').value = data.date;
    
    Object.keys(data.scores).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = data.scores[key];
            // Trigger input event to update progress bars
            input.dispatchEvent(new Event('input'));
        }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteScore(index) {
    if (!confirm('Are you sure you want to delete this measurement?')) return;
    
    let history = JSON.parse(localStorage.getItem('seoHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('seoHistory', JSON.stringify(history));
    loadHistory();
}

function clearHistory() {
    if (!confirm('Are you sure you want to clear ALL history? This cannot be undone!')) return;
    
    localStorage.removeItem('seoHistory');
    loadHistory();
}

function resetForm() {
    if (!confirm('Do you want to reset the form?')) return;
    
    inputs.forEach(input => {
        input.value = '';
        const progressId = 'progress_' + input.id;
        const progressBar = document.getElementById(progressId);
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    });
    document.getElementById('checkDate').valueAsDate = new Date();
    calculateScores();
}

function exportData() {
    const history = JSON.parse(localStorage.getItem('seoHistory') || '[]');
    
    if (history.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Create CSV
    let csv = 'Date,Total Score,PageSpeed Mobile,PageSpeed Desktop,GTmetrix,Mobile Friendly,SSL,Meta Titles,Meta Desc,Content Quality,H1 Tags,Ahrefs DR,Moz DA,Core Vitals,Navigation,Schema,Coverage,Sitemap\n';
    
    history.forEach(item => {
        csv += `${item.date},${item.overall},`;
        csv += `${item.scores.pagespeed_mobile || 0},`;
        csv += `${item.scores.pagespeed_desktop || 0},`;
        csv += `${item.scores.gtmetrix || 0},`;
        csv += `${item.scores.mobile || 0},`;
        csv += `${item.scores.ssl || 0},`;
        csv += `${item.scores.metatitles || 0},`;
        csv += `${item.scores.metadesc || 0},`;
        csv += `${item.scores.contentquality || 0},`;
        csv += `${item.scores.h1tags || 0},`;
        csv += `${item.scores.ahrefs || 0},`;
        csv += `${item.scores.moz || 0},`;
        csv += `${item.scores.corevitals || 0},`;
        csv += `${item.scores.navigation || 0},`;
        csv += `${item.scores.richresults || 0},`;
        csv += `${item.scores.coverage || 0},`;
        csv += `${item.scores.sitemap || 0}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-score-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Load history on page load
loadHistory();
