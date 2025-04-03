<template>
    <div class="q-pa-md">
      <!-- Botón para abrir el modal -->
      <h4>Facturas</h4>
      <hr>
      <div class="tittle">
        <q-input v-model="search" placeholder="Buscar producto" outlined dense clearable>
          <template v-slot:append>
            <q-btn flat icon="search" @click="getDatafromAPI" />
          </template>
        </q-input>
  
        <div class="add">
          <q-btn label="Crear" icon="add" @click="showModal = true" class="crear"
            style="background-color: #007bff; color: white; border-radius: 6px; padding: 10px 20px; font-weight: 600;" />
        </div>
      </div>
  
      <!-- Tabla de Facturas -->
      <q-table flat bordered :rows="rows.reverse()" :columns="columns" row-key="id" v-model:pagination="pagination"
        :rows-per-page-options="[10, 20, 50]">
        <template v-slot:header="props">
          <tr>
            <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
              <span>{{ col.label }}</span>
            </th>
          </tr>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn size="sm" color="primary" icon="visibility" @click="viewInvoicemodal = true; selectedInvoice = props.row" />
          </q-td>
        </template>
  
      </q-table>
  
      <!-- Modal de Registro de Factura -->
      <q-dialog v-model="showModal" maximized>
        <q-card>
          <q-card-section class="row items-center justify-between bg-primary text-white">
            <div class="text-h6">Registrar Factura</div>
            <q-btn icon="close" flat dense @click="showModal = false" />
          </q-card-section>
  
          <q-card-section style="padding:  20px 130px 10px">
            <q-form @submit.prevent="submitInvoice">
              <h4 style=" font-size: 13px;"> Información de la Factura</h4>
              <div class="row q-col-gutter-md">
                <q-select v-model="factura.numbering_range_id" :options="rangeOptions" label="Tipo de Documento"
                  class="col-6 input-field" outlined emit-value dense map-options />
  
                <q-input v-model="factura.reference_code" label="Código de Referencia" class="col-6 input-field" outlined
                  dense />
  
                <q-select v-model="factura.customer" :options="customers" label="Cliente" option-label="names" map-options
                  class="col-4 input-field" outlined dense />
                <q-input :model-value="factura.customer?.identification" label="Identificación" class="col-2 input-field"
                  outlined readonly dense />
                <q-input :model-value="factura.customer?.email" label="Email" class="col-4 input-field" outlined readonly
                  dense />
                <q-input :model-value="factura.customer?.phone" label="Teléfono" class="col-2 input-field" outlined
                  readonly dense />
              </div>
  
              <h4 style="font-size: 13px;">Periodo de facturación</h4>
              <div class="row q-col-gutter-md q-mt-md">
  
                <div class="col-4">
                  <q-input v-model="factura.billing_period.start_date" label="Inicio Facturación" type="date"
                    class="col-3 input-field" outlined dense />
                  <q-input v-model="factura.billing_period.start_time" label="Hora Inicio" type="time"
                    class="col-2 input-field" outlined dense />
                </div>
                <div class="col-4">
  
                  <q-input v-model="factura.billing_period.end_date" label="Fin Facturación" type="date"
                    class="col-3 input-field" outlined dense />
                  <q-input v-model="factura.billing_period.end_time" label="Hora Fin" type="time"
                    class="col-3 input-field" outlined dense />
                </div>
  
                <div class="col-4">
                  <q-input v-model="factura.payment_due_date" label="Fecha de Vencimiento" type="date" outlined dense
                    class="col-3 input-field" />
                </div>
              </div>
  
              <h4 style="font-size: 13px"> Productos</h4>
              <q-select v-model="productSelected" :options="selectproduct" label="Seleccionar" option-label="name"
                          @update:model-value="agregarItem" dense filled behavior="menu" style="width: 200px; margin-bottom: 3%;" />
  
              <q-table separator="cell" :rows="factura.products" :columns="productColumns" row-key="id"
                class="q-mt-md compact-table">
  
                <template v-slot:header="props">
                  <tr>
                    <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                      <span>{{ col.label }}</span>
                    </th>
                  </tr>
                </template>
  
                <template v-slot:body-cell-quantity="props">
                  <q-td :props="props">
                    <q-input v-model="props.row.quantity" type="number" min="1" dense outlined
                      @update:model-value="updateTotal(props.row)" />
                  </q-td>
                </template>
                <template v-slot:body-cell-price="props">
                  <q-td :props="props">
  
                    <q-input v-model="props.row.price" type="number" dense readonly outlined
                      @update:model-value="updateTotal(props.row)" />
                  </q-td>
                </template>
                <template v-slot:body-cell-tax_rate="props">
                  <q-td :props="props">
                    <q-input v-model="props.row.tax_rate" type="string" outlined readonly dense
                      @update:model-value="updateTotal(props.row)" />
                  </q-td>
                </template>
  
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn color="red" icon="delete" dense flat @click="deleteProduct(props.row)" />
                  </q-td>
                </template>
  
  
             
              </q-table>
  
  
  
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-6 input-field">
                  <q-select v-model="factura.payment_method_code" :options="paymentMethods" label="Método de Pago"
                    outlined option-label="label" option-value="value" emit-value map-options />
  
                  <q-select v-model="factura.payment_form" label="Forma de Pago" option-label="name" option-value="id"
                    emit-value map-options :options="paymentForms" class="col-6 input-field" outlined dense />
                </div>
  
              </div>
              <q-input v-model="factura.observation" label="Observaciones" type="textarea" class="q-mt-md" outlined />
  
              <div class="button-group">
                <q-btn label="Cancelar" color="blue-grey" flat @click="showModal = false" />
                <q-btn label="Guardar" color="green" class="q-ml-md" @click="submitInvoice" />
                <q-btn label="Guardar y enviar" color="blue" class="q-ml-md" @click="submitInvoice" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
  
      <!-- Modal de vizualizacion de factura -->
      <q-dialog persistent v-model="viewInvoicemodal">
        <q-card>
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>
              Factura Electrónica No. FE 141
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
          </q-toolbar>
  
          <!-- Contenido de la factura (scrollable) -->
          <q-card-section class="scroll" style="max-height: calc(100vh - 50px)">
            <div class="factura-container q-pa-md">
              <!-- Logo y Encabezado -->
              <div class="header-section row items-center q-px-md q-pt-md">
                <div class="col-xs-12 col-sm-3">
                  <div class="logo-placeholder flex flex-center">
                    <q-icon name="image" size="xl" color="grey-5" />
                    <div class="logo-text">LOGO</div>
                  </div>
                </div>
                <div class="col-xs-12 col-sm-9 text-center text-sm-right">
                  <div class="text-h4 text-weight-bold text-primary">FACTURA ELECTRÓNICA {{ factura.number }}</div>
                  <div class="text-subtitle1">{{ factura.company }}</div>
                  <div>NIT: </div>
                  <div>TEL: </div>
                  <div>direccion</div>
  
                </div>
              </div>
  
              <q-separator class="q-my-sm" color="grey-8" />
  
              <!-- Número de factura y fechas -->
              <div class="row q-px-md q-pt-md">
                <div class="col-xs-12 col-md-6">
                  <div class="info-box">
                    <div class="info-box-title">Factura No.</div>
                    <div class="info-box-content text-h5">{{ factura.number }}</div>
                  </div>
                </div>
                <div class="col-xs-12 col-md-6">
                  <div class="info-box">
                    <div class="info-box-title">Fecha de Expedición</div>
                    <div class="info-box-content">{{ factura.payment_due_date }}</div>
                  </div>
                </div>
              </div>
  
              <!-- Datos del cliente -->
              <div class="section-box q-mx-md q-mt-md">
                <div class="section-title">DATOS DEL CLIENTE</div>
                <div class="row q-col-gutter-md">
                  <div class="col-xs-12 col-sm-6">
                    <div class="info-field">
                      <span class="info-label">Cliente:</span>
                      <span class="info-value">{{ factura.customer.names }}</span>
                    </div>
                    <div class="info-field">
                      <span class="info-label">Documento:</span>
                      <span class="info-value">{{ factura.customer.identification }}</span>
                    </div>
                  </div>
                  <div class="col-xs-12 col-sm-6">
                    <div class="info-field">
                      <span class="info-label">Teléfono:</span>
                      <span class="info-value">{{ factura.customer.phone }}</span>
                    </div>
                    <div class="info-field">
                      <span class="info-label">Dirección:</span>
                      <span class="info-value">{{ factura.customer.address }}</span>
                    </div>
                    <div class="info-field">
                      <span class="info-label">Correo Electrónico:</span>
                      <span class="info-value">{{ factura.customer.email }}</span>
  
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Detalle de productos -->
              <div class="section-box q-mx-md q-mt-md">
                <div class="section-title">DETALLE DE LA TRANSACCIÓN</div>
  
                <q-table flat bordered :rows="factura.items" :columns="columnsVista" row-key="id" hide-pagination
                  hide-bottom class="detalle-table">
                  <template v-slot:body-cell-descripcion="props">
                    <q-td :props="props">
                      <div class="text-bold">{{ props.row.product.name }}</div>
                      <div class="text-caption text-grey-7">CONVENIO DE ASOCIACIÓN NO. 644</div>
                    </q-td>
                  </template>
                </q-table>
              </div>
  
              <!-- Totales -->
              <div class="row q-mx-md q-mt-md">
                <div class="col-xs-12 col-md-6">
                  <div class="valor-letras-box">
                    <div class="text-caption">VALOR EN LETRAS:</div>
                    <div>Dieciocho millones ochocientos doce mil novecientos diecinueve pesos</div>
                  </div>
                </div>
                <div class="col-xs-12 col-md-6">
                  <div class="totales-box">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>18.812.919,00</span>
                    </div>
                    <div class="total-row">
                      <span>Descuentos:</span>
                      <span>0,00</span>
                    </div>
                    <div class="total-row text-h6 text-weight-bold">
                      <span>TOTAL:</span>
                      <span>18.812.919,00</span>
                    </div>
                    <div class="total-row">
                      <span>Descuentos:</span>
                      <span>0,00</span>
                    </div>
                    <div class="total-row text-h6 text-weight-bold">
                      <span>TOTAL:</span>
                      <span>18.812.919,00</span>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Forma de pago y observaciones -->
              <div class="row q-mx-md q-mt-md">
                <div class="col-xs-12 col-md-6">
                  <div class="section-box">
                    <div class="section-title">FORMA DE PAGO</div>
                    <div class="info-field">
                      <span class="info-label">Método:</span>
                      <span class="info-value">Efectivo</span>
                    </div>
                    <div class="info-field">
                      <span class="info-label">Valor:</span>
                      <span class="info-value">$18.812.919,00</span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-12 col-md-6">
                  <div class="section-box">
                    <div class="section-title">OBSERVACIONES</div>
                    <div class="observaciones">
                      <p>A Acta lectura de venta estructural se compara enviando a la serie del cambio territorial a Ley
                        1211
                        de 2009.</p>
                      <p>No responsable de: UA.-Actividad Excelenteza SE II. Actividades de Seguros Sociales.</p>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Pie de página -->
              <div class="footer q-mt-lg q-pa-md text-center text-grey-7">
                <div>Fundación Colorbia Vive y Rueba - NIT: 210.654-22-5</div>
                <div>www.fundaciel.org - Tel: (001) 3125118851</div>
                <div class="q-mt-sm text-caption">Resolución DIAN No. 18764000234234 - Fecha: 15/03/2024</div>
              </div>
            </div>
          </q-card-section>
  
          <!-- Botones de acción -->
          <q-card-actions align="right" class="bg-grey-2 q-pa-md">
            <q-btn label="Imprimir" color="primary" icon="print" @click="imprimirFactura" />
            <q-btn label="Cerrar" color="grey" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, toRaw } from "vue";
  import { getData } from "../services/apiClient";
  import { backgetData, backpostData } from "../services/backClient";
  import { date } from 'quasar'
  
  
  const showModal = ref(false);
  const productSelected = ref("");
  const selectproduct = ref();
  
  const search = ref('');
  const viewInvoicemodal = ref(false);
  const selectedInvoice = ({});
  const factura = ref({
    billing_period: {},
    products: []
  });
  
  
  
  
  
  
  const rows = ref([]);
  const pagination = ref({ page: 1, rowsPerPage: 10 });
  
  const columns = [
    { name: "createdAt", label: "Fecha de Elaboración", align: "center", field: row => date.formatDate(row.createdAt, 'DD/MM/YYYY'), sortable: true },
    { name: "number", label: "Número", align: "center", field: row => row.number, sortable: true },
    { name: "reference_code", label: "Código", align: "center", field: row => row.reference_code, sortable: true },
    /*  { name: "identification", label: "Identificación", align: "center", field: row => row.customer.identification, sortable: true }, */
    /* { name: "Cliente", label: "Cliente", align: "center", field: row => row.customer.names, sortable: true }, */
    { name: "actions", label: "Acciones", align: "center" }
  ];
  
  const productColumns = [
    { name: 'name', label: 'Producto', field: 'name', align: 'center' },
    { name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'center' },
    { name: 'price', label: 'Valor Unitario', field: 'price', align: 'center' },
    { name: 'tax_rate', label: 'Impuesto', field: 'tax_rate', align: 'center' },
    { name: 'total', label: 'Valor Total', field: 'total', align: 'center', sortable: true, style: "font-weight: bold;" },
    { name: 'actions', label: 'Acciones', align: 'center' }
  
  ];
  
  
  const customers = ref([]);
  
  const rangeOptions = ref([]);
  
  
  
  // Función para eliminar un producto
  function deleteProduct(product) {
    factura.value.products = factura.value.products.filter(p => p !== product);
  }
  
  const paymentForms = ref([
    { id: 1, name: 'Pago de Contado' },
    { id: 2, name: 'Pago de Crédito' },
  ]);
  
  const paymentMethods = [
    { value: "10", label: "Efectivo" },
    { value: "42", label: "Consignación" },
    { value: "20", label: "Cheque" },
    { value: "47", label: "Transferencia" },
    { value: "71", label: "Bonos" },
    { value: "72", label: "Vales" },
    { value: "1", label: "Medio de pago no definido" },
    { value: "49", label: "Tarjeta Débito" },
    { value: "48", label: "Tarjeta Crédito" },
    { value: "ZZZ", label: "Otro*" }
  ];
  
  
  async function getDatafromAPI() {
    try {
      const invoiceResponse = await backgetData("invoice");
      rows.value = invoiceResponse;
  
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
  
  async function getDataCustomers() {
    try {
      const customerResponse = await backgetData("customer");
      customers.value = customerResponse;
  
    } catch (error) {
      console.error("Error al obtener los datos:", error);
  
    }
  }
  
  async function getDataProducts() {
    try {
      const productResponse = await backgetData("/product");
      selectproduct.value = productResponse
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
  
  function agregarItem() {
    if(productSelected){
      const producto = toRaw(productSelected.value)
      factura.value.products.push(producto)
      console.log(factura.value.products)
    }
  }
  
  
   
  
  
  const submitInvoice = async () => {
    try {
      console.log("datos componente", toRaw(factura.value));
      const response = await backpostData("/invoice", {
        numbering_range_id: Number(factura.value.numbering_range_id),
        reference_code: factura.value.reference_code,
        observation: factura.value.observation,
        payment_form: factura.value.payment_form,
        payment_due_date: factura.value.payment_due_date,
        /*     payment_due_date: "2025-12-30", */
        payment_method_code: factura.value.payment_method_code,
        billing_period: {
          start_date: factura.value.billing_period.start_date,
          start_time: factura.value.billing_period.start_time + ":00",
          end_date: factura.value.billing_period.end_date,
          end_time: factura.value.billing_period.end_time + ":00",
          /*  start_date: "2025-01-10",
           start_time: "00:00:00",
           end_date: "2025-02-09",
           end_time: "23:59:59" */
        },
        customer: toRaw(factura.value.customer),
        products: factura.value.products.map((item) => toRaw(item)),
        state: 1
      });
      console.log("vamo hp");
      console.log(response);
      showModal.value = false;
      await getDatafromAPI();
    } catch (error) {
      console.error("Error al guardar factura:", error);
    }
  };
  
  
  
  onMounted(() => {
    getDatafromAPI();
    fetchRangesNumber();
    getDataCustomers();
    getDataProducts();
  });
  
  //endpoints
  
  const fetchRangesNumber = async () => {
    try {
      const response = await getData('/v1/numbering-ranges?filter[id]&filter[document]&filter[resolution_number]&filter[technical_key]&filter[is_active]');
      if (response.data && Array.isArray(response.data)) {
        rangeOptions.value = response.data.map(item => ({ value: item.id, label: item.document }));
      } else {
        console.error('❌ Estructura inesperada en la respuesta:', response.data);
      }
  
    } catch (error) {
      console.error('❌ Error al obtener los rangos:', error);
    }
  };
  </script>
  
  <style scoped>
  * {
    margin: 0%;
    box-sizing: border-box;
    font-family: 'NunitSans', sans-serif;
    font-size: 11px;
  }
  
  .compact-table {
    font-size: small;
  }
  
  .input-field {
    margin-bottom: 10px;
    font-size: small;
    box-sizing: border-box;
  
  }
  
  .tittle {
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin: 20px;
  
  }
  
  h4 {
  
    color: #37465a;
    font-size: 24px;
    font-weight: 800;
    line-height: 25px;
    margin-bottom: 10px;
    font-family: NunitSans, sans-serif;
    text-align: center;
  }
  
  .tabla-header {
    font-weight: bold;
    text-transform: uppercase;
    background-color: #007bff;
    color: white;
    padding: 12px;
    text-align: center;
  }
  
  .button-group {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .factura-container {
    max-width: 900px;
    margin: 0 auto;
    font-family: 'Roboto', Arial, sans-serif;
  }
  
  .header-section {
    background-color: #f5f5f5;
    padding-bottom: 20px;
  }
  
  .logo-placeholder {
    height: 100px;
    width: 100%;
    border: 2px dashed #ccc;
    border-radius: 4px;
    position: relative;
  }
  
  .logo-text {
    position: absolute;
    color: #999;
    font-size: 12px;
  }
  
  .section-box {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 15px;
    background-color: #fafafa;
  }
  
  .section-title {
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 10px;
    font-size: 1.1rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 5px;
  }
  
  .info-box {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    height: 100%;
  }
  
  .info-box-title {
    font-size: 0.8rem;
    color: #666;
  }
  
  .info-box-content {
    font-weight: bold;
    font-size: 1.2rem;
  }
  
  .info-field {
    margin-bottom: 8px;
  }
  
  .info-label {
    font-weight: bold;
    margin-right: 5px;
    color: #555;
  }
  
  .info-value {
    color: #333;
  }
  
  .detalle-table {
    border-radius: 4px;
    overflow: hidden;
  }
  
  .valor-letras-box {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    height: 100%;
  }
  
  .totales-box {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    height: 100%;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #ddd;
  }
  
  .total-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .observaciones {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .footer {
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
  
    .q-dialog,
    .q-dialog * {
      visibility: visible;
    }
  
    .q-dialog {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0;
      box-shadow: none;
    }
  
    .q-toolbar,
    .q-card-actions {
      display: none;
    }
  }
  </style>