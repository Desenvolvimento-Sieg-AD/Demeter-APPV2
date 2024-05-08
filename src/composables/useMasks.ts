export const useMasks = () => {
  return {
    cnpj: '##.###.###/####-##',
    boleto: '#'.repeat(47),
    cpf: '###.###.###-##',
    cep: '#####-###',
    default: '',
    email: '',
    text: '',
    money: '',
    phone: '(##) #####-####',
    aleatoria: 'XXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    number: '#*',
    percent: '###',
    datetime: '##/##/#### - ##h##',
    'numero-nf': '#'.repeat(9)
  }
}
