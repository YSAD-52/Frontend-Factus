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
        <q-btn label="Crear" icon="add" @click="openDialog" class="crear"
          style="background-color: #007bff; color: white; border-radius: 6px; padding: 10px 20px; font-weight: 600;" />
      </div>
    </div>
  
      <!-- Tabla de Facturas -->
      <q-table
        flat
        bordered
        :rows="rows.reverse()"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 20, 50]"
      >
      <template v-slot:header="props">
          <tr>
            <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
              <span>{{ col.label }}</span>
            </th>
          </tr>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn size="sm" color="primary" icon="visibility" @click="viewInvoice(props.row)" />
          </q-td>
        </template>
      </q-table>
  
      <!-- Modal de Registro de Factura -->
      <q-dialog v-model="showModal" maximized>
        <q-card>
          <q-card-section class="row items-center justify-between bg-primary text-white">
            <div class="text-h6">Nueva Factura de Venta / Ingresos</div>
            <q-btn icon="close" flat dense @click="showModal = false" />
          </q-card-section>
  
          <q-card-section style="padding:  20px 130px 10px">
            <q-form @submit.prevent="submitInvoices">

               <!-- Datos principales -->
          <div class="row q-col-gutter-md">
            <q-select v-model="invoice.numbering_range_id" :options="rangeOptions"  label="Rango de numeración"  class="col-3 input-field" outlined />
            <q-input v-model="invoice.reference_code" label="Código de referencia" class="col-3 input-field" outlined />
            <q-input v-model="invoice.date" label="Fecha de elaboración" type="date" class="col-6 input-field" outlined />
            <q-select v-model="invoice.customer" :options="customers" label="Cliente" class="col-6 input-field" emit-value map-options outlined />
            <q-input v-model="invoice.customer_identification" label="Identificación" class="col-6 input-field" outlined disable />
            <q-input v-model="invoice.customer_email" label="Email" class="col-6 input-field" outlined disable />
              <q-input v-model="invoice.customer_phone" label="Teléfono" class="col-6 input-field" outlined disable />

          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <q-input v-model="invoice.billing_period.start_date" label="Inicio Facturación" type="date" class="col-6" outlined />
            <q-input v-model="invoice.billing_period.start_time" label="Hora Inicio" type="time" class="col-6" outlined />
            <q-input v-model="invoice.billing_period.end_date" label="Fin Facturación" type="date" class="col-6" outlined />
            <q-input v-model="invoice.billing_period.end_time" label="Hora Fin" type="time" class="col-6" outlined />
           
          </div>

          <!-- Tabla de productos -->
          <q-table  
          class="q-mt-md"
      :rows="selectedProducts"
      :columns="[
        { name: 'producto', label: 'Producto', field: 'descripcion', align: 'left' },
        { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
        { name: 'valorUnitario', label: 'Valor Unitario', field: 'valorUnitario', align: 'right' },
        { name: 'impuesto', label: 'Impuesto', field: 'impuesto', align: 'right' },
        { name: 'valorTotal', label: 'Valor Total', field: 'valorTotal', align: 'right' },
        { name: 'acciones', label: 'Acciones', align: 'center' },
      ]"
      row-key="id">

      <template v-slot:body="props">
        <q-tr :props="props">
          <!-- Selección del producto -->
          <q-td>
            <q-select
              v-model="itemselected"
              :options="products"
              option-value="id"
              option-label="descripcion"
              emit-value
              map-options
              filled
              @update:model-value="actualizarProducto(props.rowIndex)"
            />
          </q-td>

          <!-- Cantidad Editable -->
          <q-td>
            <q-input
              v-model.number="props.row.cantidad"
              type="number"
              filled
              min="1"
              @update:model-value="calcularTotal(props.rowIndex)"
            />
          </q-td>

          <!-- Valor Unitario -->
          <q-td>{{ props.row.valorUnitario.toFixed(2) }}</q-td>

          <!-- Impuesto -->
          <q-td>{{ props.row.impuesto.toFixed(2) }}</q-td>

          <!-- Valor Total -->
          <q-td>{{ props.row.valorTotal.toFixed(2) }}</q-td>

          <!-- Botón para eliminar -->
          <q-td class="text-center">
            <q-btn color="red" flat dense icon="delete" @click="eliminarProducto(props.rowIndex)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

          <!-- Formas de pago -->
          <div class="row q-col-gutter-md q-mt-md">
            <q-select v-model="invoice.paymentMethod" :options="paymentMethods" label="Forma de Pago" class="col-6 input-field" outlined />
            <q-input v-model="invoice.paymentAmount" label="Monto" type="number" class="col-6 input-field" outlined />
          </div>

          <!-- Totales -->
          <div class="totals-box">
            <div><strong>Total Bruto:</strong> {{ totalBruto }}</div>
            <div><strong>Descuentos:</strong> {{ totalDescuentos }}</div>
            <div class="total-neto"><strong>Total Neto:</strong> {{ totalNeto }}</div>
          </div>

          <!-- Observaciones -->
          <q-input v-model="invoice.observations" label="Observaciones" type="textarea" class="q-mt-md input-field" outlined />

          <!-- Botones -->
          <div class="button-group">
            <q-btn label="Cancelar" color="blue-grey" flat @click="showModal = false" />
            <q-btn label="Guardar" color="green" class="q-ml-md" @click="submitInvoices" />
            <q-btn label="Guardar y enviar" color="blue" class="q-ml-md" @click="submitAndSendInvoice" />
          </div>
  
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from "vue";
  import { getData } from "../services/apiClient";
  import { backgetData, backpostData } from "../services/backClient";
  import {date} from 'quasar'

  // Opciones de clientes, vendedores y métodos de pago
const customerss = ref([{ label: 'Cliente A', value: 'cliente_a' }, { label: 'Cliente B', value: 'cliente_b' }]);
const sellers = ref([{ label: 'Vendedor 1', value: 'vendedor_1' }, { label: 'Vendedor 2', value: 'vendedor_2' }]);
const paymentMethods = ref([{ label: 'Efectivo', value: 'efectivo' }, { label: 'Transferencia', value: 'transferencia' }]);





const selectedProducts= ref([]);

const addProduct = () => {
  selectedProducts.value.push(
{
  id: null,
  descripcion: '',
  cantidad: 1,
  valorUnitario: '',
  impuesto: '',
  valorTotal: ''
 
  }
  );
}
;

const actualizarProducto = (index) => {
  const productoSeleccionado = products.value.find(
    (p) => p.id === selectedProducts.value[index].id
  );

  if (productoSeleccionado) {
    selectedProducts.value[index].name = productoSeleccionado.name;
    selectedProducts.value[index].price = productoSeleccionado.price;
    selectedProducts.value[index].tax_rate = productoSeleccionado.tax_rate;
    calcularTotal(index);
  }
};

// 📌 Calcular el total cuando cambia la cantidad
const calcularTotal = (index) => {
  const producto = selectedProducts.value[index];
  producto.valorTotal = producto.quantity * (producto.price + producto.tax_rate);
};

// 📌 Eliminar un producto de la tabla
const eliminarProducto = (index) => {
  selectedProducts.value.splice(index, 1);
};

// 🎯 Observa los cambios en la cantidad y recalcula el total
watch(
  () => selectedProducts.value.map((p) => p.cantidad),
  () => selectedProducts.value.forEach((_, i) => calcularTotal(i)),
  { deep: true }
);


// Cálculo de totales
const totalBruto = computed(() => invoice.value.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0));
const totalDescuentos = computed(() => 0);
const totalNeto = computed(() => totalBruto.value - totalDescuentos.value);

// Enviar factura
const submitInvoices = () => {
  console.log('Factura guardada:', invoice.value);
  showModal.value = false;
};

const submitAndSendInvoice = () => {
  console.log('Factura enviada:', invoice.value);
  showModal.value = false;
};
  
  const showModal = ref(false);
  const selectedProductId = ref(null);

  const openDialog = () => {
    showModal.value = true;
    console.log(showModal.value);
  }
  
 /*  const invoice = ref({
  customer: null,
  seller: null,
  date: new Date().toISOString().slice(0, 10), // Fecha actual
  invoiceNumber: '',
  items: [],
  paymentMethod: null,
  paymentAmount: 0,
  observations: '',
}); */


   const invoice = ref({
  numbering_range_id: 8,
  reference_code: "",
  observation: "",
  payment_form: "",
  payment_due_date: "",
  payment_method_code: "",
  billing_period:{
                 /* start_date:factura.value.billing_period.start_date,
                start_time:factura.value.billing_period.start_time,
                end_date:factura.value.billing_period.end_date,
                end_time:factura.value.billing_period.end_time , */
                start_date:"2024-01-10",
                start_time:"00:00:00",
                end_date:"2024-02-09",
                end_time:"23:59:59"
            },
  customer: null,
  customer_email: "",
  customer_phone: "",
  products: [],
  product_price: "",
  product_tax: "",
  product_quantity: 1
}); 
  
  const rows = ref([]);
  const pagination = ref({ page: 1, rowsPerPage: 10 });
  
  const columns = [
    { name: "createdAt", label: "Fecha de Elaboración", align: "center", field: row => date.formatDate(row.createdAt, 'DD/MM/YYYY'), sortable: true },
    { name: "reference_code", label: "Código", align: "center", field: row => row.reference_code, sortable: true },
    { name: "identification", label: "Identificación", align: "center", field: row => row.customer.identification, sortable: true },
    { name: "Cliente", label: "Cliente", align: "center", field: row => row.customer.names, sortable: true },
    { name: "actions", label: "Acciones", align: "center" }
  ];
  
  const customers = ref([]);
  const products = ref([ ]);
  const rangeOptions = ref([]);
  
  async function getDatafromAPI() {
    try {
      const invoiceResponse = await backgetData("invoice");
      rows.value = invoiceResponse;

      const customerResponse = await backgetData("customer");
      customerss.value = customerResponse;

      const productResponse = await backgetData("product");
      products.value = productResponse;
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }

  const addItem = (item) => {
    invoice.value.products.push(item);
  }
  const submitInvoice = async () => {
    try {
      const response = await backpostData("invoice", invoice.value);
      console.log(response);
      showModal.value = false;
      await getDatafromAPI();
    } catch (error) {
      console.error("Error al guardar factura:", error.response ? error.response.data : error.message);
    }
  };

  
  function viewInvoice(invoiceData) {
    console.log("Ver factura:", invoiceData);
  }
  
  onMounted(() => {
    getDatafromAPI();

  });

  //endpoints

  const fetchRangesNumber = async () => {
    try {
      const response = await getData('/v1/numbering-ranges?filter[id]&filter[document]&filter[resolution_number]&filter[technical_key]&filter[is_active]');
      if(response.data && Array.isArray(response.data)){
        rangeOptions.value = response.data.map(item => ({value: item.id, label: item.document}));
      } else{
        console.error('❌ Estructura inesperada en la respuesta:', response.data);
      }
      
    } catch (error) {
      console.error('❌ Error al obtener los rangos:', error);
    }
  };
  </script>

  <style scoped>
   *{
  margin: 0%;
  box-sizing: border-box;
  font-family: 'NunitSans', sans-serif;
  font-size: 11px;


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
  background-color: #85aacf;
  color: white;
  padding: 12px;
  text-align: center;
}

/* Diseño general de la tarjeta */
.invoice-card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Estilo del encabezado */
.header {
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Botón de cerrar */
.close-btn {
  background: white;
  color: #85aacf;
  border-radius: 50%;
  transition: 0.3s;
}
.close-btn:hover {
  background: #EEEEEE;
}

/* Campos de entrada */
.input-field {
  border-radius: 8px;
}

/* Tabla de productos */
.product-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Totales */
.totals-box {
  margin-top: 16px;
  padding: 12px;
  background: #F5F5F5;
  border-radius: 8px;
  text-align: right;
  font-size: 16px;
}
.total-neto {
  font-size: 18px;
  font-weight: bold;
  color: #00796B;
}

/* Botones */
.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
  