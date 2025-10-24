const tag_name_ticket = "main";
const ID_COMBOBOX_CONTENT = 'TEMPLATES_CONTENT';
const ID_COMBOBOX_SOLUTION = 'TEMPLATES_SOLUTION';

const ID_COMBOBOX_ORDER_COMPOSITION = 'TEMPLATES_ORDER_COMPOSITION';

const LABEL_DIV_CSS_SELECTOR = "label.label-module___LTH6W__label.large-input-module__24r9Fa__largeInput__label div";
const TEXT_AREA_CSS_SELECTOR = "textarea.large-input-module__24r9Fa__largeInput__textarea";



const templates = [
      {
          value: "0", 
          title: "Шаблоны для содержания:", 
          text: ""
      },
      {
          value: "1", 
          title: "Недовложение Доставка", 
          text: "Гость жалуется на недовложение \nСтикеры \nПакет/тов:   Нумерации/ия: \n"},
      {
          value: "2", 
          title: "Гостя нет дома (звонков не было)", 
          text: "Гость жалуется на отмену заказа, по причине «Гостя нет дома». Звонков в дверь/домофон/на телефон не поступало.\n"},
      {
          value: "3", 
          title: "Отметка доставлен, заказ не получен", 
          text: "У гостя в приложении заказ доставлен, но гость его не получал. До курьера дозвониться не удалось\n"
      },
      {
          value: "13", 
          title: "Жалоба на пролитые напитки", 
          text: "Гость жалуется на пролитые напитки , подстаканники были , стикер был , напиток находился в отдельном пакете.\n"
      },
      {
          value: "23", 
          title: "Гость ошибся рестораном", 
          text: "Гость ошибся рестораном , просит отменить заказ , требует вдс , ожидает ос.\n"
      },
      {
          value: "33", 
          title: "Долгое ожидание(доставка)", 
          text: "Гость жалуется на долгое ожидание доставки, целевое время не нарушено / нарушено. До курьера дозвонились / недозвонились\n"
      },
      {
          value: "4", 
          title: "--------------------------", 
          text: ""
      },
      {
          value: "5", 
          title: "Шаблоны для решения:", 
          text: ""
      },
      {
          value: "6", 
          title: "Извинения = лояльность", 
          text: "Принесены извинения, лояльность возвращена"
      },
      {
          value: "7", 
          title: "Извинения + Промо = Лояльность", 
          text: "Принесены извинения, подарили промо, лояльность возвращена"
      },
      {
          value: "8", 
          title: "Извинения и ВДС", 
          text: "Принесены извинения, возвращены ДС"
      },
      {
          value: "9", 
          title: "-Извинения -Промо = Нужна ОС", 
          text: "Гостя не устроило извинение, от промо отказался, нужна ОС"
      },
      {
          value: "10", 
          title: "Отказ от детализации в чат", 
          text: "Гость отказывается присылать детализацию в чат"
      }
   
];


function templateHandler(){
      let 
            select_content = document.getElementById(ID_COMBOBOX_CONTENT),
            select_solution = document.getElementById(ID_COMBOBOX_SOLUTION);
     let index = -1;

     let select = null;
      if (select_content) {
            index = 0;
            select = select_content;
      }
      else if (select_solution){
            index = 1;
            select = select_solution;
      }

      if (index == -1 || !select) return;

      const text_areas = document.querySelectorAll(TEXT_AREA_CSS_SELECTOR);
      if (!text_areas || !text_areas[index]) return;


      const text_area = text_areas[index];


      text_area.value += templates[select.selectedIndex].text;
      const event = new Event('input', { bubbles: true });
      text_area.dispatchEvent(event);

}



function initItemsOrderSelect(order_id, data){
    const select = document.querySelector(`#${ID_COMBOBOX_ORDER_COMPOSITION + order_id}`);

    if (!select) return;

    select.innerHTML = "";
    let items = data.order;

    const opt_load = document.createElement("option");
    opt_load.innerText = "Загружен";
    opt_load.setAttribute("value", "");
    select.appendChild(opt_load);

    for (let i = 0; i < items.length; i++){
        const opt = document.createElement("option");
        opt.innerText = items[i].name + ` ${items[i].count} ШТ`;

        let value = items[i].name;
        if (items[i].components.length){
            value += ' (';
            for (let j = 0; j < items[i].components.length; j++){
                    let component = items[i].components[j].name + `( ${items[i].components[j].count} ШТ )`;
                    value += component + ";";
            }

            value += ')';
        }

        opt.setAttribute("value", value +";");
        select.appendChild(opt);
    }

    select.addEventListener("change", () => {
            const text_area = document.querySelector(TEXT_AREA_CSS_SELECTOR);
            if (!text_area) return;

            
            text_area.value += select.options[select.selectedIndex].value;

            const event = new Event('input', { bubbles: true });
            text_area.dispatchEvent(event);


        }


    );

}




function templateHelper() {



  const observer = new MutationObserver(() => {
    
    let temp = window.location.pathname;
    let start = temp.indexOf("complaint/") + 10; 

    let ticket_uuid = temp.slice(start, start + 36);   //uuid ticket
    let test = window.location.href + "/";
    if (
        test.includes(`https://mykitchen.digital/new/complaint/${ticket_uuid}/create?uniqueId=`)
          ||
        test.includes(`https://mykitchen.digital/new/complaint/${ticket_uuid}/create/`)
          ||
        test.includes(`https://mykitchen.digital/new/complaint/${ticket_uuid}/edit`)
    ){

        const urlParams = new URLSearchParams(window.location.search);
        let order_id = urlParams.get('uniqueId');
        let flag_solution = test.includes("refund");
        console.log(`flag_solution: ${flag_solution}`)
        


          const tag_main = document.getElementsByTagName('main')[0];
          if (!tag_main){
            console.log("Error with main");

            return;
          }



          let el = tag_main.querySelector(`#${ID_COMBOBOX_CONTENT}`);
          if (flag_solution)
              el = tag_main.querySelector(`#${ID_COMBOBOX_SOLUTION}`);

          if (el) return;


          let labels_div = tag_main.querySelectorAll(LABEL_DIV_CSS_SELECTOR);

          let label_div = labels_div[0];
          if (flag_solution){
                label_div = labels_div[1];
          }

    
          if (!label_div) return;

          label_div.setAttribute('align', 'right');
         

          let text_areas = document.querySelectorAll(TEXT_AREA_CSS_SELECTOR);
          if (!text_areas || text_areas[0].disabled) return;

          let text_area = text_areas[0];
          if (flag_solution){
             text_area = text_areas[1];
          }
          
     

          
          const select = document.createElement("select");
          
          select.addEventListener("change", ()=>{ templateHandler();});
          select.classList.add("custom_select_0");

          select.id = ID_COMBOBOX_CONTENT;
          if (flag_solution)
            select.id = ID_COMBOBOX_SOLUTION;

          for (let i = 0; i < templates.length; i++){
              const opt = document.createElement("option");
              opt.setAttribute("value", templates[i]['value']);
              opt.innerText = templates[i]['title'];
              select.appendChild(opt);
          }

          label_div.appendChild(select);

          const span = document.createElement('span');
          span.innerHTML = "<b> Шаблоны </b>";
          label_div.appendChild(span);


          if (!flag_solution && order_id){
                // создаем отображение состава
                let select_composition = document.createElement("select");
                select_composition.id = ID_COMBOBOX_ORDER_COMPOSITION + order_id;
                let opt = document.createElement("option");
                opt.setAttribute("value", "");
                opt.innerText = "Не подгрузился";
                select_composition.appendChild(opt);

                select_composition.classList.add("custom_select_0");
                label_div.appendChild(select_composition);
                let span = document.createElement('span');
                span.innerHTML = "<b> Состав </b>";
                label_div.appendChild(span);

                fetch(`https://mykitchen.digital/new/api/checkout/unique/${order_id}`).then(
                    resp => resp.json()
                ).then(
                    data => {
                        
                        initItemsOrderSelect(order_id, data.value);
                       
                    }
                );
          }
    }


    

    

    

  });

  observer.observe(document, { childList: true, subtree: true });
};


templateHelper();