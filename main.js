let today = new Date()

let currentMonth = today.getMonth()
let currentYear = today.getFullYear()
let months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

let monthYear = document.getElementById('month-year')

let cont = 0;

const baseURL = 'http://localhost:3000/events'

let data = []

const request = new XMLHttpRequest()
request.open('GET', baseURL)
request.responseType = 'json'
request.send()
request.onload = function () {
    data = request.response
    showCalendar(currentYear, currentMonth)
}


// FUNÇÕES REFERENTE AO CALENDÁRIO //

// Responsável por avançar 1 mês //
function next() {

    //Se for o último mês do ano, vá para o ano seguinte //
    currentYear = currentMonth === 11 ? currentYear + 1 : currentYear
    currentMonth = (currentMonth + 1) % 12
    showCalendar(currentYear, currentMonth)
}

// Responsável por voltar 1 mês //
function back() {

    //Se for o primeiro mês do ano, vá para o ano anterior //
    currentYear = currentMonth === 0 ? currentYear - 1 : currentYear
    currentMonth = currentMonth === 0 ? 11 : currentMonth - 1
    showCalendar(currentYear, currentMonth)
}

// Responsavel por capturar os valores do select //
function dateAt() {

    currentMonth = parseInt(document.getElementById('month').value)
    currentYear = parseInt(document.getElementById('year').value)
    showCalendar(currentYear, currentMonth)
}

// Verificará qual data possui eventos salvos e aplicará um estilo diferenciado a esta data
function eventMarked(day, month, year, cell) {

    const date = new Date(`${year}-${month + 1}-${day}`).toLocaleDateString()

    data.forEach(el => {
        if (date === el.date) {
            cell.style.boxShadow = '0px 0px 0px 5px inset #00ff79b8'
        }
    })
}

// Função Principal - Responsável por Construir e exibir o Calendário //
function showCalendar(year, month) {

    let dayOne = (new Date(year, month).getDay()) // Dia 1 da semana //
    let daysOfMonth = 32 - (new Date(year, month, 32).getDate())

    let table = document.getElementById('days')

    // Iniciando o calendário
    table.innerHTML = ''

    monthYear.innerHTML = months[month] + " - " + year
    selectYear = year
    selectMonth = month

    let date = 1
    for (let i = 0; i <= 5; i++) {

        // Linhas da Tabela //
        const row = document.createElement('tr')

        // Criando cada célula da linha //
        for (let j = 0; j < 7; j++) {
            // Adicionando Células vazias no começo do calendário //
            if (j < dayOne && i === 0) {
                const td = document.createElement('td')
                const cellText = document.createTextNode('')

                td.style.cursor = 'default'
                td.appendChild(cellText);
                row.appendChild(td)
            }
            else if (date > daysOfMonth) {
                break;
            }
            else {
                const td = document.createElement('td')
                const cellText = document.createTextNode(date)

                // Verificará se essa data possui algum evento salvo //
                eventMarked(date, month, year, td)

                // Exibirá o pop-up de cadastro de eventos ao clicar em determinada data //
                td.onclick = function () { newEvent(td.textContent, month, year) }


                // Selecionando o dia atual //
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    td.classList.add('bg-primary')
                    td.classList.add('text-light')
                }
                td.appendChild(cellText);
                row.appendChild(td);
                date++;
            }
        }
        table.appendChild(row)
    }
}

// FUNÇÕES REFERENTE AO POPUP - EVENTOS //

// Ao clicar sobre a data exibirá o pop-up de eventos //
function newEvent(day, month, year) {

    let currentDate = new Date(year, month, day).toLocaleDateString()

    document.getElementById('pop-up').style.display = 'block'
    document.getElementById('date').innerHTML = `${day} de ${months[month]} de ${year}`
    document.getElementById('date').setAttribute('name', currentDate)

    loadEvent(currentDate)
}
// Responsável por verificar e carregar os eventos registrados //
function loadEvent(date) {

    const reload = new XMLHttpRequest()

    reload.open("GET", baseURL)
    reload.responseType = 'json'
    reload.send()
    reload.onload = function () {
        data = reload.response

        data.forEach(el => {
            if (date === el.date) {
                const eventList = document.getElementById('event-list')
                const event = document.createElement('p')

                event.innerHTML = el.name
                event.onclick = loadData
                eventList.appendChild(event)
            }
        })
    }
}

// Responsável por carregar os dados do evento clicado pelo usuário no componente 'detalhes' //
function loadData() {

    data.forEach(el => {
        if (this.innerHTML == el.name) {
            document.getElementById('event-name').setAttribute('key', el.id)
            document.getElementById('event-name').innerHTML = el.name
            document.getElementById('event-date').innerHTML = el.date
            document.getElementById('event-local').innerHTML = el.local
            document.getElementById('event-note').innerHTML = el.note

            document.getElementById('edit').removeAttribute('disabled')
            document.getElementById('delete').removeAttribute('disabled')
        }
    })
}

// Responsável por Salvar/Alterar um evento no Banco de Dados //
function saveEvent(method = 'POST') {

    if (document.getElementById('name').value === '') {
        alert('ERRO, Insira o nome do evento!')
    }
    else {
        console.log(data)
        const key = document.getElementById('event-name').getAttribute('key')

        cont = key === null ? cont + 1 : key

        data[cont] = {
            id: data[data.length + 1],
            name: document.getElementById('name').value,
            date: document.getElementById('date').getAttribute('name'),
            local: document.getElementById('local').value,
            note: document.getElementById('note').value,
        }

        const request = new XMLHttpRequest()

        if (method === 'PATCH') {
            request.open(method, `${baseURL}/${key}`)
            data[cont].id = cont
        }
        else {
            request.open(method, baseURL)
        }

        request.setRequestHeader("Content-Type", "application/json")
        request.responseText = 'json'
        request.send(JSON.stringify(data[cont]))
        request.onload = function () {
            clearData()
        }
        request.onloadend = function () {
            loadEvent(data[cont].date)
        }
    }
}

// Responsável por carregar os dados que estão no componente 'detalhes' para os inputs //
function editEvent() {
    document.getElementById('name').value = document.getElementById('event-name').innerHTML
    document.getElementById('local').value = document.getElementById('event-local').innerHTML
    document.getElementById('note').value = document.getElementById('event-note').innerHTML

    document.getElementById('save').style.display = 'none'
    document.getElementById('change').style.display = 'block'
}

// Responsável por apagar um evento do BD //
function deleteEvent() {
    const key = document.getElementById('event-name').getAttribute('key')
    const date = document.getElementById('event-date').innerHTML

    try {
        const del = new XMLHttpRequest()
        del.open('DELETE', `${baseURL}/${key}`)
        del.responseType = 'json'
        del.send()
        del.onload = function () {
            clearData()
            loadEvent(date)
        }
    }
    catch (e) {
        alert('Ação não executada, por favor, tente novamente...')
    }
}

// Responsável por alterar dados do evento selecionado //
function updateEvent() {

    const key = document.getElementById('event-name').getAttribute('key')

    data.forEach(el => {
        if (key == el.id) {
            saveEvent('PATCH')
        }
    })
}

// Fecha o Pop-Up e limpa todos os dados
function closePopUp() {

    document.getElementById('pop-up').style.display = 'none'

    clearData()
}

// Reseta os valores dos inputs //
function clearInputs() {
    const inputs = document.querySelectorAll('input')
    inputs.forEach(e => e.value = '')

    document.getElementById('save').style.display = 'block'
    document.getElementById('change').style.display = 'none'
}

// Limpa os dados do pop-up //
function clearData() {

    clearInputs()

    document.getElementById('event-list').innerHTML = ''

    document.getElementById('event-name').innerHTML = ''
    document.getElementById('event-date').innerHTML = ''
    document.getElementById('event-local').innerHTML = ''
    document.getElementById('event-note').innerHTML = ''

    document.getElementById('edit').setAttribute('disabled', true)
    document.getElementById('delete').setAttribute('disabled', true)
}
