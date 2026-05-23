import os

def limpar_tela():
    os.system('cls' if os.name == 'nt' else 'clear')

def obter_valor(mensagem):
    while True:
        try:
            valor = float(input(mensagem))
            if valor < 0:
                print("Valor não pode ser negativo. Tente novamente.")
                continue
            return valor
        except ValueError:
            print("Valor inválido. Digite um número.")

def calcular_lucro_individual(custos_guia):
    faturamento_guia = custos_guia['faturamento']
    custos_total = (
        custos_guia['ingresso'] + 
        custos_guia['transporte'] + 
        custos_guia['bebida'] + 
        custos_guia['guiamento']
    )
    return faturamento_guia - custos_total

def main():
    print("=" * 50)
    print("SISTEMA DE CÁLCULO DE LUCRO - GUIAMENTO")
    print("=" * 50)
    
    # Dicionários para armazenar os dados de cada guia
    guia1 = {}
    guia2 = {}
    
    print("\n--- DADOS DO Mari ---")
    guia1['ingresso'] = obter_valor("Valor gasto com ingressos: R$ ")
    guia1['transporte'] = obter_valor("Valor gasto com transporte: R$ ")
    guia1['bebida'] = obter_valor("Valor gasto com bebidas: R$ ")
    guia1['guiamento'] = obter_valor("Valor gasto com guiamento: R$ ")
    guia1['faturamento'] = obter_valor("Faturamento total: R$ ")
    
    print("\n--- DADOS DO Matheus ---")
    guia2['ingresso'] = obter_valor("Valor gasto com ingressos: R$ ")
    guia2['transporte'] = obter_valor("Valor gasto com transporte: R$ ")
    guia2['bebida'] = obter_valor("Valor gasto com bebidas: R$ ")
    guia2['guiamento'] = obter_valor("Valor gasto com guiamento: R$ ")
    guia2['faturamento'] = obter_valor("Faturamento total: R$ ")
    
    # Calcular lucros individuais
    lucro_guia1 = calcular_lucro_individual(guia1)
    lucro_guia2 = calcular_lucro_individual(guia2)
    
    # Calcular lucro total e divisão
    lucro_total = lucro_guia1 + lucro_guia2
    lucro_por_pessoa = lucro_total / 2
    
    # Limpar tela antes de mostrar resultados
    limpar_tela()
    
    # Exibir resultados detalhados
    print("\n" + "=" * 50)
    print("RESULTADO DO CÁLCULO DE LUCRO")
    print("=" * 50)
    
    print("\n--- Mari ---")
    print(f"Ingressos:      R$ {guia1['ingresso']:.2f}")
    print(f"Transporte:     R$ {guia1['transporte']:.2f}")
    print(f"Bebidas:        R$ {guia1['bebida']:.2f}")
    print(f"Guiamento:      R$ {guia1['guiamento']:.2f}")
    print(f"TOTAL CUSTOS:   R$ {(guia1['ingresso'] + guia1['transporte'] + guia1['bebida'] + guia1['guiamento']):.2f}")
    print(f"Faturamento:    R$ {guia1['faturamento']:.2f}")
    print(f"LUCRO Mari:   R$ {lucro_guia1:.2f}")
    
    print("\n--- Matheus ---")
    print(f"Ingressos:      R$ {guia2['ingresso']:.2f}")
    print(f"Transporte:     R$ {guia2['transporte']:.2f}")
    print(f"Bebidas:        R$ {guia2['bebida']:.2f}")
    print(f"Guiamento:      R$ {guia2['guiamento']:.2f}")
    print(f"TOTAL CUSTOS:   R$ {(guia2['ingresso'] + guia2['transporte'] + guia2['bebida'] + guia2['guiamento']):.2f}")
    print(f"Faturamento:    R$ {guia2['faturamento']:.2f}")
    print(f"LUCRO Matheus:   R$ {lucro_guia2:.2f}")
    
    print("\n--- RESUMO FINAL ---")
    print(f"Lucro Total da Empresa:   R$ {lucro_total:.2f}")
    print(f"Lucro para cada guia:     R$ {lucro_por_pessoa:.2f}")
    
    print("\n" + "=" * 50)
    
    # Verificar se houve prejuízo
    if lucro_guia1 < 0:
        print(f"\n⚠️ ATENÇÃO: Mari teve prejuízo de R$ {abs(lucro_guia1):.2f}")
    if lucro_guia2 < 0:
        print(f"⚠️ ATENÇÃO: Matheus teve prejuízo de R$ {abs(lucro_guia2):.2f}")
    if lucro_total < 0:
        print("⚠️ ATENÇÃO: A empresa teve prejuízo total!")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()