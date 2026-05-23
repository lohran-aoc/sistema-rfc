// API URL (ajuste conforme o deploy)
const API_URL = window.location.origin;

// Variável para armazenar histórico
let historicoCalculos = [];

// Função principal de cálculo
async function calcularLucro() {
    // Obter valores do Guia 1
    const guia1 = {
        ingresso: parseFloat(document.getElementById('ingresso1').value) || 0,
        transporte: parseFloat(document.getElementById('transporte1').value) || 0,
        bebida: parseFloat(document.getElementById('bebida1').value) || 0,
        guiamento: parseFloat(document.getElementById('guiamento1').value) || 0,
        faturamento: parseFloat(document.getElementById('faturamento1').value) || 0
    };

    // Obter valores do Guia 2
    const guia2 = {
        ingresso: parseFloat(document.getElementById('ingresso2').value) || 0,
        transporte: parseFloat(document.getElementById('transporte2').value) || 0,
        bebida: parseFloat(document.getElementById('bebida2').value) || 0,
        guiamento: parseFloat(document.getElementById('guiamento2').value) || 0,
        faturamento: parseFloat(document.getElementById('faturamento2').value) || 0
    };

    // Calcular custos totais
    const custosTotais1 = guia1.ingresso + guia1.transporte + guia1.bebida + guia1.guiamento;
    const custosTotais2 = guia2.ingresso + guia2.transporte + guia2.bebida + guia2.guiamento;

    // Calcular lucros individuais
    const lucro1 = guia1.faturamento - custosTotais1;
    const lucro2 = guia2.faturamento - custosTotais2;

    // Calcular lucro total e divisão
    const lucroTotal = lucro1 + lucro2;
    const lucroPorPessoa = lucroTotal / 2;

    // Atualizar resultados na tela
    atualizarResultados(faturamento1, custosTotais1, lucro1, faturamento2, custosTotais2, lucro2, lucroTotal, lucroPorPessoa);

    // Salvar no banco de dados
    await salvarCalculo(guia1, guia2);
    
    // Mostrar seção de resultados
    document.getElementById('resultados').style.display = 'block';
    document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' });
    
    // Exibir alertas
    exibirAlertas(lucro1, lucro2, lucroTotal);
}

// Salvar cálculo no backend
async function salvarCalculo(guia1, guia2) {
    try {
        const response = await fetch(`${API_URL}/api/salvar-calculo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guia1, guia2 })
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarNotificacao('✅ Cálculo salvo no histórico!', 'success');
            carregarHistorico(); // Recarregar histórico
            carregarEstatisticas(); // Atualizar estatísticas
        } else {
            mostrarNotificacao('❌ Erro ao salvar cálculo', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('❌ Erro de conexão com o servidor', 'error');
    }
}

// Carregar histórico de cálculos
async function carregarHistorico() {
    try {
        const response = await fetch(`${API_URL}/api/historico`);
        const historico = await response.json();
        
        const historicoDiv = document.getElementById('historico-lista');
        if (historicoDiv) {
            historicoDiv.innerHTML = historico.map(item => `
                <div class="historico-item">
                    <div class="historico-data">${new Date(item.data_calculo).toLocaleString('pt-BR')}</div>
                    <div class="historico-lucros">
                        <span>Lucro Total: ${formatarMoeda(item.lucro_total)}</span>
                        <span>Por Guia: ${formatarMoeda(item.lucro_divisao)}</span>
                    </div>
                    <button onclick="deletarCalculo(${item.id})" class="btn-deletar">🗑️</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Carregar estatísticas
async function carregarEstatisticas() {
    try {
        const response = await fetch(`${API_URL}/api/estatisticas`);
        const stats = await response.json();
        
        const statsDiv = document.getElementById('estatisticas');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-card">
                    <h4>Total de Cálculos</h4>
                    <p>${stats.total_calculos || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Lucro Total Geral</h4>
                    <p>${formatarMoeda(stats.lucro_total_geral || 0)}</p>
                </div>
                <div class="stat-card">
                    <h4>Média por Cálculo</h4>
                    <p>${formatarMoeda(stats.lucro_medio || 0)}</p>
                </div>
                <div class="stat-card">
                    <h4>Maior Lucro</h4>
                    <p class="lucro-positivo">${formatarMoeda(stats.maior_lucro || 0)}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Deletar cálculo
async function deletarCalculo(id) {
    if (confirm('Tem certeza que deseja deletar este cálculo?')) {
        try {
            const response = await fetch(`${API_URL}/api/deletar-calculo/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                mostrarNotificacao('✅ Cálculo deletado com sucesso!', 'success');
                carregarHistorico();
                carregarEstatisticas();
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarNotificacao('❌ Erro ao deletar cálculo', 'error');
        }
    }
}

// Exportar relatório
async function exportarRelatorio() {
    try {
        const response = await fetch(`${API_URL}/api/relatorio`);
        const relatorio = await response.json();
        
        let csv = 'Data,Total de Cálculos,Soma dos Lucros,Média de Lucro\n';
        relatorio.forEach(item => {
            csv += `${item.data},${item.total_calculos},${item.soma_lucros},${item.media_lucro}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        mostrarNotificacao('📊 Relatório exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('❌ Erro ao exportar relatório', 'error');
    }
}

// Atualizar resultados na tela
function atualizarResultados(faturamento1, custos1, lucro1, faturamento2, custos2, lucro2, lucroTotal, lucroDivisao) {
    document.getElementById('result-faturamento1').innerHTML = formatarMoeda(faturamento1);
    document.getElementById('result-custos1').innerHTML = formatarMoeda(custos1);
    document.getElementById('result-lucro1').innerHTML = formatarMoeda(lucro1);
    aplicarClasseLucro('result-lucro1', lucro1);

    document.getElementById('result-faturamento2').innerHTML = formatarMoeda(faturamento2);
    document.getElementById('result-custos2').innerHTML = formatarMoeda(custos2);
    document.getElementById('result-lucro2').innerHTML = formatarMoeda(lucro2);
    aplicarClasseLucro('result-lucro2', lucro2);

    document.getElementById('result-lucro-total').innerHTML = formatarMoeda(lucroTotal);
    document.getElementById('result-lucro-divisao').innerHTML = formatarMoeda(lucroDivisao);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
    });
}

function aplicarClasseLucro(elementId, valor) {
    const element = document.getElementById(elementId);
    if (valor < 0) {
        element.classList.add('lucro-negativo');
        element.classList.remove('lucro-positivo');
    } else {
        element.classList.add('lucro-positivo');
        element.classList.remove('lucro-negativo');
    }
}

function limparFormulario() {
    // Limpar todos os inputs
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
    });
    
    // Esconder resultados
    document.getElementById('resultados').style.display = 'none';
    
    // Mostrar notificação
    mostrarNotificacao('🧹 Todos os campos foram limpos!', 'info');
}

// Sistema de notificações temporárias
function mostrarNotificacao(mensagem, tipo) {
    // Remover notificação existente
    const notificacaoExistente = document.querySelector('.toast-notification');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }
    
    // Criar elemento de notificação
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${mensagem}</span>
        </div>
    `;
    
    // Adicionar estilos à notificação
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Cores diferentes para cada tipo
    switch(tipo) {
        case 'success':
            toast.style.backgroundColor = '#28a745';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ffc107';
            toast.style.color = '#333';
            break;
        case 'error':
            toast.style.backgroundColor = '#dc3545';
            break;
        default:
            toast.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Adicionar evento de tecla Enter para calcular
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        calcularLucro();
    }
});

// Função para validar inputs em tempo real
function validarInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value && this.value < 0) {
                this.value = 0;
            }
        });
    });
}

// Inicializar validação
validarInputs();

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    carregarEstatisticas();
});