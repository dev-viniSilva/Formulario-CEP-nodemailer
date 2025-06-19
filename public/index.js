const formulario = document.getElementById("formulario");
const nome = document.getElementById("nome");
const sobrenome = document.getElementById("sobrenome");
const cep = document.getElementById("cep");
const rua = document.getElementById("rua");
const bairro = document.getElementById("bairro");
const idade = document.getElementById("idade");
const cidade = document.getElementById("cidade");
const estado = document.getElementById("estado");
const textDeInvalidation = document.getElementById("invalidCEP");
const erroIdade = document.getElementById("erroIdade");
const erroNome = document.getElementById("erroNome");
const erroSobrenome = document.getElementById("erroSobrenome");
const mensagemEmail = document.getElementById("mensagem-email");

let enderecoValido = false;
let formEnviado = false; // controla se já tentou enviar (para mostrar erros no blur só depois disso)


function validarIdade() {
  const idadeNumero = parseInt(idade.value);
  return !isNaN(idadeNumero) && idadeNumero >= 18;
}


function validarNome(valor) {
  const regex = /^[A-Za-zÀ-ÿ]+$/;
  return regex.test(valor);
}

function showToast(mensagem, duracao = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duracao);
}



cep.addEventListener("blur", async () => {
  const cepValido = await verificarCep();
  enderecoValido = cepValido;

   if (cepValido) {
    textDeInvalidation.innerHTML = '';
    cep.style.borderColor = '';
  } else if (formEnviado) {
    textDeInvalidation.innerHTML = "CEP inválido ou não encontrado.";
    cep.style.borderColor = 'red';
  }
});


[rua, bairro, cidade, estado].forEach(campo => {
  campo.addEventListener("input", () => {
    enderecoValido = false;
  });
});


nome.addEventListener("blur", () => {
  if (!formEnviado) return; 

  if (!validarNome(nome.value)) {
    erroNome.innerHTML = "Nome inválido, tente novamente.";
    nome.style.borderColor = "red";
  } else {
    erroNome.innerHTML = '';
    nome.style.borderColor = '';
  }
});

sobrenome.addEventListener("blur", () => {
  if (!formEnviado) return; 

  if (!validarNome(sobrenome.value)) {
    erroSobrenome.innerHTML = "Sobrenome inválido, tente novamente.";
    sobrenome.style.borderColor = "red";
  } else {
    erroSobrenome.innerHTML = '';
    sobrenome.style.borderColor = '';
  }
});

idade.addEventListener("blur", () => {
  if (!formEnviado) return; 

  if (!validarIdade()) {
    erroIdade.innerHTML = 'Você não pode se cadastrar, pois é menor de 18 anos.';
    idade.style.borderColor = "red";
  } else {
    erroIdade.innerHTML = '';
    idade.style.borderColor = '';
  }
});

formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  formEnviado = true; 
  let formularioValido = true;

  const idadeValida = validarIdade();
  if (!idadeValida) {
    erroIdade.innerHTML = 'Você não pode se cadastrar, pois é menor de 18 anos.';
    idade.style.borderColor = "red";
    idade.focus();
    formularioValido = false;
  } else {
    erroIdade.innerHTML = '';
    idade.style.borderColor = '';
  }

  const cepValido = await verificarCep();
  if (!cepValido) {
    textDeInvalidation.innerHTML = "CEP inválido ou não encontrado.";
    cep.focus();
    formularioValido = false;
  } else {
    textDeInvalidation.innerHTML = "";
  }

  if (!validarNome(nome.value)) {
    erroNome.innerHTML = "Nome inválido, tente novamente.";
    nome.style.borderColor = "red";
    nome.focus();
    formularioValido = false;
  } else {
    erroNome.innerHTML = '';
    nome.style.borderColor = '';
  }

  if (!validarNome(sobrenome.value)) {
    erroSobrenome.innerHTML = "Sobrenome inválido, tente novamente.";
    sobrenome.style.borderColor = "red";
    sobrenome.focus();
    formularioValido = false;
  } else {
    erroSobrenome.innerHTML = '';
    sobrenome.style.borderColor = '';
  }

  if (!formularioValido) return; 

  const formData = new FormData(formulario);
  const dados = Object.fromEntries(formData.entries());

  try {
  showToast("Email em andamento");
  const resposta = await fetch('https://formulario-cep-nodemailer-1.onrender.com/enviar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  if (resposta.ok) {
    formulario.reset();
    window.location.href = "check.html";
    formEnviado = false;
  } else {
    showToast("Erro ao enviar o email.", 10000);
  }
} catch (erro) {
  console.error('Erro na requisição:', erro);
  showToast("Erro na conexão com o servidor.", 10000);
}

});

async function verificarCep() {
  const cepNumeros = cep.value.replace(/\D/g, '');

  if (cepNumeros.length !== 8) return false;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
    const data = await response.json();

    if (data.erro) return false;

    rua.value = data.logradouro || "";
    bairro.value = data.bairro || "";
    cidade.value = data.localidade || "";
    estado.value = data.uf || "";

    return true;
  } catch (error) {
    return false;
  }
}
