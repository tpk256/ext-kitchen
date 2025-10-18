CLASS_LIST_INFO = "HELPER_EXT";
COUNT_MONTH_CHECK = 2;

function fraudHelper(selector, callback) {
  let current_order_id = null, current_customer_id = null;

  const observer = new MutationObserver(() => {
    let temp = window.location.pathname;
    console.log(window.location);
    if (temp.endsWith('orders/') || temp.endsWith('orders')){
        current_order_id = null;
        console.log("without order");
        return;
    }
        
    let start = temp.indexOf("orders/") + 7; 

    temp = temp.slice(start, start + 36);
    

    const el = document.querySelector(selector);
    if (el) {
            if (temp === current_order_id){
                console.log("Дубль информация");
                }
            else{

                console.log(`Новый заказ ${temp}; old: ${current_order_id}`);
                current_order_id = temp;

                let element_info = el.querySelector(`div.${CLASS_LIST_INFO}`);
              
                if (!element_info)
                {    
                    element_info = document.createElement('div');
                    element_info.classList.add(CLASS_LIST_INFO);
                    element_info.style.width = "100%";
                    element_info.style.height = "200px";
                    element_info.style.overflowY = "auto";
                    element_info.style.overflowX = "hidden";
                    element_info.style['border-bottom'] = "solid";


                }

                element_info.innerHTML = "";
                el.insertBefore(element_info, el.firstChild);
                
                fetch(
                    `https://${window.location.hostname}/internal/api/v3/orders/${current_order_id}.json?fields[order][]=customer_id`
                ).then(resp => {
                    return resp.json();
                }).then(json_data => {
                    console.log(json_data);
                    let customer_id = json_data["data"]["attributes"]["customer_id"];
                    if (customer_id){
                        fetch(
                            `https://${window.location.hostname}/internal/api/v3/customers/${customer_id}/orders.json?include%5B%5D=restaurant&page%5Bsize%5D=1&page%5Boffset%5D=0`
                        ).then(resp => {
                            return resp.json();
                        }).then(
                            data => {
                                let total = data['meta']?.page?.total_count;

                                if (!total){
                                    console.log("No data!");
                                    return;
                                }

                                fetch(
                                    `https://${window.location.hostname}/internal/api/v3/customers/${customer_id}/orders.json?include%5B%5D=restaurant&page%5Bsize%5D=${total}&page%5Boffset%5D=0`
                                ).then(
                                    resp => {return resp.json()}
                                ).then(
                                    data => {
                                        let orders = data['data'];
                                        let id = 1;
                                        let border_data = new Date();
                                        border_data.setMonth( border_data.getMonth() - COUNT_MONTH_CHECK);

                                        let success_orders_for_three_months = [];
                                        let all_success_orders = 0; // заказы, которые были без возвратов каких-либо
                                        let refund_partial = 0;

                                        orders.forEach(element => {
                                            const attrs = element['attributes'];
                                            const payment_status = attrs.payment_status;
                                            const simple_status = attrs.simple_status;
                                            const created_date = new Date(attrs.created_at);
                                            const order_channel = attrs.device_available_channel_channel;
                                            

                                            if (order_channel == "terminal"){
                                                // заказ через киоск
                                                if (simple_status == "collected" && payment_status == "Paid"){
                                                    all_success_orders++;
                                                    if (border_data < created_date){
                                                        success_orders_for_three_months.push(element);
                                                    }
                                                }
                                            }
                                            else if (order_channel == "mobile"){
                                                //  проверку по статусам;
                                                if (simple_status == "collected" && payment_status == "Paid"){
                                                    all_success_orders++;
                                                    if (border_data < created_date){
                                                        success_orders_for_three_months.push(element);
                                                    }
                                                }
                                                else if (simple_status == "collected" && payment_status == "PartialRefunded"){
                                                    refund_partial++;
                                                }
                                            }


                                          
                                        });

                                        // const p_id_order = document.createElement('p');
                                        // p_id_order.innerHTML = `<b>Текущий заказ ${current_order_id}</b>`
                                        // p_id_order.style.fontSize = "18px";
                                        // // p_id_order.style['padding-left'] = "7ch";
                                        // element_info.appendChild(p_id_order);

                                        if (all_success_orders + refund_partial == 0){
                                            const p_warning_first_order = document.createElement('p');
                                            p_warning_first_order.style.color = 'red';
                                            p_warning_first_order.innerHTML = `<b>У ГОСТЯ ЭТО ПЕРВЫЙ ЗАКАЗ</b>`
                                            p_warning_first_order.style.fontSize = "18px";
                                            p_warning_first_order.style['padding-left'] = "7ch";
                                            element_info.appendChild(p_warning_first_order);
                                        }
                                        else{
                                            const p_all_counts_order = document.createElement('p');
                                            p_all_counts_order.innerHTML = `<b>Общее число успешных заказов</b>: ${all_success_orders}`;
                                            p_all_counts_order.style['padding-left'] = "2ch";
                                            element_info.appendChild(p_all_counts_order);
                                        }
                                        

                                        const p_refund_partial = document.createElement('p');
                                        p_refund_partial.style['padding-left'] = "2ch";
                                        p_refund_partial.innerHTML = `<b>Общее число частичных ВДС</b>: ${refund_partial}`;
                                        element_info.appendChild(p_refund_partial);

                                        const p_count_succes_collected = document.createElement('p');
                                        p_count_succes_collected.style['padding-left'] = "2ch";
                                        p_count_succes_collected.innerHTML = `<b>Успешных заказов за ${COUNT_MONTH_CHECK} месяца/цев</b>: ${success_orders_for_three_months.length}`;
                                        element_info.appendChild(p_count_succes_collected);
                                        console.log(success_orders_for_three_months);

                                        orders.forEach(element => {
                                            const attrs = element['attributes'];
                                            const created_date = new Date(attrs.created_at);
                                            if (attrs.is_error) return;
                                            if (created_date < border_data) return;

                                            const payment_status = attrs.payment_status;
                                            if(
                                                (payment_status == "Refunded" && attrs.responsible != "customer")
                                                            || 
                                                payment_status == "PartialRefunded"
                                            ){
                                                const href = document.createElement('a');
                                                href.style.color = "var(--c-blue)";
                                                const p = document.createElement('p');
                                                p.style['padding-left'] = "4ch";
                                                
                                                href.innerText = `${id}: CRP (по возврату, гипотетическая)`;
                                            
                                                id++;
                                                
                                                href.setAttribute('href', `https://${window.location.hostname}/new/complaint?uniqueId=${element.id}&kfcId=${attrs.kfc_id}`);
                                                href.setAttribute('target', `_blank`);
                                                

                                                p.appendChild(href);
                                                element_info.appendChild(p);


                                            }
                                            
                                        });
                                            }
                                        )


                                
                                
                            }
                        )
                    }
                    else
                        element_info.innerText = ` customer: ${customer_id}`;



                    
                });

                console.log(2)

                

                // callback();
            }
    }
  });


  observer.observe(document, { childList: true, subtree: true });
}

fraudHelper("aside.orders-info-aside__content", () =>{});