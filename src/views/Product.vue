<template>
    <q-page class="q-pa-md">
      <h4>Productos y Servicios</h4>
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
  
      <!-- tabla principal -->
      <q-table
      flat
      bordered 
      :rows="rows" 
      :columns="columns" 
      row-key="id" 
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50]">
          <template v-slot:header="props">
            <tr>
              <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                <span>{{ col.label }}</span>
              </th>
            </tr>
          </template>
          <template v-slot:body-cell-state="props">
          <q-td :props="props" class="q-pa-sm">
            <span style="color: green;" v-if="props.row.state == 1">Activo</span>
            <span style="color: red;" v-else>Inactivo</span>
          </q-td>
        </template>
  
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="tabla-cell opciones">
            <q-btn icon="edit" color="primary" flat @click="editProduct(props.row)" />
            <q-btn :icon="props.row.state === 1 ? 'remove_circle' : 'check_circle'"
              :color="props.row.state === 1 ? 'negative' : 'positive'" flat @click="showConfirmationState(props.row)" />
          </q-td>
        </template>
        </q-table>
  
  
      <!-- modal para agregar producto o servicio -->
      <q-card>
        <q-dialog v-model="dialog" persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card class="modal-add" style="max-width: 800px; width: 100%;">
        <!-- Encabezado del Modal -->
        <q-bar class="bg-primary text-white">
          <div class="text-h6">Registrar Producto o Servicio</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
  
        <q-card-section>
          <q-form @submit.prevent="saveProduct">
            <!-- Secciones en dos columnas -->
            <div class="row q-col-gutter-md">
              <!-- Columna 1 - Detalles del Producto -->
              <div class="col-12 col-md-6">
                <h5 class="text-primary">Detalles del Producto</h5>
                <q-separator />
                <q-input v-model="form.code_reference" label="Código de Referencia" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                <q-input v-model="form.name" label="Nombre del Producto" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                <q-input v-model="form.price" label="Precio" outlined dense prefix="$" lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                <q-input v-model="form.tax_rate" label="Tasa de Impuesto (%)" outlined dense type="number" suffix="%" lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                <q-select v-model="form.unit_measure_id" :options="unitOptions" label="Unidad de Medida" emit-value map-options outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
              </div>
  
              <!-- Columna 2 - Información Tributaria -->
              <div class="col-12 col-md-6">
                <h5 class="text-primary">Información Tributaria</h5>
                <q-separator />
                <q-select v-model="form.standard_code_id" :options="standardCodeOptions" option-label="name" option-value="name" emit-value map-options label="Código Estándar" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                <q-toggle v-model="form.is_excluded" label="Está Excluido" color="primary" />
                <q-select v-model="form.tribute_id"
                 :options="tributeOptions"
                  map-options
                   emit-value label="Tributo"
                    outlined
                     dense
                      lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
  
                <!-- Impuestos Retenidos -->
                <div class="text-subtitle1 text-weight-bold q-mt-md">Impuestos Retenidos</div>
                <q-list bordered class="q-mb-md">
                  <q-item v-for="(tax, index) in form.withholding_taxes" :key="index">
                    <q-item-section>
                      <q-input v-model="tax.code" label="Código de Retención" dense outlined />
                    </q-item-section>
                    <q-item-section>
                      <q-input v-model="tax.withholding_tax_rate" label="Tasa de Retención (%)" dense outlined type="number" suffix="%" />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn icon="delete" color="red" dense flat @click="removeTax(index)" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-btn icon="add" color="primary" label="Añadir Retención" @click="addTax" flat />
              </div>
            </div>
  
            <!-- Botones de acción -->
            <q-card-actions align="right">
              <q-btn label="Cancelar" color="grey" flat @click="resetForm" />
              <q-btn type="submit" label="Guardar" color="primary" unelevated @click="updateProduct" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
      </q-dialog>
  
      <!-- modal para editar producto o servicio -->
  
      <q-card>
        <q-dialog v-model="modalEditProduct" persistent transition-show="slide-up" transition-hide="slide-down">
          <q-card class="modal-add" style="max-width: 800px; width: 100%;">
            <!-- Encabezado del Modal -->
            <q-bar class="bg-primary text-white">
              <div class="text-h6">Editar Producto</div>
              <q-space />
              <q-btn dense flat icon="close" v-close-popup />
            </q-bar>
  
            <q-card-section>
              <q-form @submit.prevent="saveProduct">
                <!-- Secciones en dos columnas -->
                <div class="row q-col-gutter-md">
                  <!-- Columna 1 - Detalles del Producto -->
                  <div class="col-12 col-md-6">
                    <h5 class="text-primary">Detalles del Producto</h5>
                    <q-separator />
                    <q-input v-model="dataEditProduct.code_reference" label="Código de Referencia" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                    <q-input v-model="dataEditProduct.name" label="Nombre del Producto" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                    <q-input v-model="dataEditProduct.price" label="Precio" outlined dense prefix="$" lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                    <q-input v-model="dataEditProduct.tax_rate" label="Tasa de Impuesto (%)" outlined dense type="number" suffix="%" lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                    <q-select v-model="dataEditProduct.unit_measure_id" :options="unitOptions" label="Unidad de Medida" emit-value map-options outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                  </div>
  
                  <!-- Columna 2 - Información Tributaria -->
                  <div class="col-12 col-md-6">
                    <h5 class="text-primary">Información Tributaria</h5>
                    <q-separator />
                    <q-select v-model="dataEditProduct.standard_code_id" :options="standardCodeOptions" option-label="name" option-value="name" emit-value map-options label="Código Estándar" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
                    <q-toggle v-model="dataEditProduct.is_excluded" label="Está Excluido" color="primary" />
                    <q-select v-model="dataEditProduct.tribute_id" :options="tributeOptions" map-options emit-value label="Tributo" outlined dense lazy-rules :rules="[val => !!val || 'Este campo es requerido']" />
  
                    <!-- Impuestos Retenidos -->
                    <div class="text-subtitle1 text-weight-bold q-mt-md">Impuestos Retenidos</div>
                    <q-list bordered class="q-mb-md">
                      <q-item v-for="(tax, index) in dataEditProduct.withholding_taxes" :key="index">
                        <q-item-section>
                          <q-input v-model="tax.code" label="Código de Retención" dense outlined />
                        </q-item-section>
                        <q-item-section>
                          <q-input v-model="tax.withholding_tax_rate" label="Tasa de Retención (%)" dense outlined type="number" suffix="%" />
                        </q-item-section>
                        <q-item-section side>
                          <q-btn icon="delete" color="red" dense flat @click="removeTax(index)" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-btn icon="add" color="primary" label="Añadir Retención" @click="addTax" flat />
                  </div>
                </div>
  
                <!-- Botones de acción -->
                <q-card-actions align="right">
                  <q-btn label="Cancelar" color="grey" flat @click="resetForm" />
                  <q-btn type="submit" label="Guardar" color="primary" unelevated />
                </q-card-actions>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
          </q-card>
      </q-card>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getData, } from '../services/apiClient';
  import { backgetData, backpostData, backputData } from '../services/backClient';
  import { Notify } from 'quasar';
  import Swal from 'sweetalert2';
  
  const columns = [
    { name: 'code_reference', label: 'Código', align: 'center', field: row => row.code_reference, sortable: true },
    { name: 'name', label: 'Producto', align: 'center', field: row => row.name, sortable: true },
    { name: 'unit_measure_id', label: 'Unidad', align: 'center', field: row => row.unit_measure_id, sortable: true },
    { name: 'price', label: 'Precio', align: 'center', field: row => row.price, sortable: true },
    { name: 'tax_rate', label: 'Impuestos', align: 'center', field: row => row.tax_rate, sortable: true },
    { name: 'state', label: 'Estado', align: 'center', field: row => row.state, sortable: true, style: "font-weight: bold;" },
    { name: 'actions', label: 'Acciones', align: 'center' }
  ];
  
  
  // listar en tabla principal
  
  const search = ref('');
  const rows = ref([]);
  const pagination = ref({ page: 1, rowsPerPage: 10 });
  const dialog = ref(false);
  const loading = ref(false);
  
  async function getDatafromAPI() {
    try {
      const response = await backgetData('product');
      rows.value = response;
      console.log(response);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }
  
  
  const openDialog = () => {
    dialog.value = true;
  };
  
  const form = ref({
    code_reference: '',
    name: '',
    price: 0,
    tax_rate: 19,
    unit_measure_id: null,
    standard_code_id: null,
    is_excluded: false,
    tribute_id: null,
    withholding_taxes: []
  });
  
  const addTax = () => {
    form.value.withholding_taxes.push({ code: '', withholding_tax_rate: null });
  };
  
  const removeTax = (index) => {
    form.value.withholding_taxes.splice(index, 1);
  };
  
  // guardar producto
  const saveProduct = async () => {
    loading.value = true;
    const newProduct = {
      ...form.value,
      price: Number(form.value.price),
      tax_rate: Number(form.value.tax_rate),
      unit_measure_id: String(form.value.unit_measure_id),
      standard_code_id: String(form.value.standard_code_id),
      tribute_id: String(form.value.tribute_id),
      withholding_taxes: form.value.withholding_taxes.map(item => ({
        code: item.code,
        withholding_tax_rate: Number(item.withholding_tax_rate)
      }))
    };
  
    try {
      console.log(newProduct);
      const response = await backpostData('product', newProduct);
      console.log(response);
      dialog.value = false;
      Notify.create({
        message: 'Producto registrado exitosamente', 
      })
      await getDatafromAPI();
  
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
    finally {
      loading.value = false;
    }
  }
  
  //editar producto
  
  const modalEditProduct = ref(false);
  const editProduct = (product) => {
    dataEditProduct.value = product;
    modalEditProduct.value = true;
  }
  
  const dataEditProduct = ref({
    code_reference: '',
    name: '',
    price: '',
    tax_rate: '',
    unit_measure_id: null,
    standard_code_id: null,
    is_excluded: false,
    tribute_id: null,
    withholding_taxes: []
  });
  
  const updateProduct = async () => {
    loading.value = true;
    const newProduct = {
      ...dataEditProduct.value,
      price: Number(dataEditProduct.value.price),
      tax_rate: Number(dataEditProduct.value.tax_rate),
      unit_measure_id: String(dataEditProduct.value.unit_measure_id),
      standard_code_id: String(dataEditProduct.value.standard_code_id),
      tribute_id: String(dataEditProduct.value.tribute_id),
      withholding_taxes: dataEditProduct.value.withholding_taxes.map(item => ({
        code: item.code,
        withholding_tax_rate: Number(item.withholding_tax_rate)
      }))
    };
    try {
      const response = await backputData(`product/${dataEditProduct.value._id}`, newProduct);
      console.log(response);
      modalEditProduct.value = false;
      Notify.create({
        message: 'Producto actualizado exitosamente',
      })
      await getDatafromAPI();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
    finally {
      loading.value = false;
    }
  };
  
  // confirmar cambios
  const confirmChangeState = async (product) => {
    if (!product) return;
  
    product.state = product.state === 1 ? 0 : 1;
  
    try {
  
      await backputData(`product/${product._id}`, { state: product.state });
  
      Notify.create({
        message: 'Estado actualizado con éxito',
      });
  
      await getDatafromAPI(); // Refresca los datos
  
    } catch (error) {
      console.error('Error al cambiar el estado:', error.response ? error.response.data : error.message);
    }
  
  };
  
  // Mostrar alerta de confirmación
  const showConfirmationState = (product) => {
  
    Swal.fire({
      title: '¿Estás seguro de cambiar el estado?',
      text: 'estas a punto de cambiar el estado del producto',
  
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar', loading: loading.value
    }).then((result) => {
      if (result.isConfirmed) {
        confirmChangeState(product);
      }
    });
  
  };
  
  
  //*****endpoints
  
  const unitOptions = ref([]);
  const tributeOptions = ref([]);
  const retentionOptions = ref([]);
  
  const fetchUnitOptions = async () => {
    try {
      const response = await getData("/v1/measurement-units");
  
      if (response.data && Array.isArray(response.data)) {
        unitOptions.value = response.data.map(unit => ({
          label: unit.name, // Lo que se muestra en el select
          value: unit.id, // Lo que se envia en el body
  
        }));
      } else {
        console.error(" Estructura inesperada en la respuesta:", response.data);
      }
    } catch (error) {
      console.error(" Error al obtener los datos:", error);
    }
  };
  
  const standardCodeOptions = ref([
    { id: 1, name: 'Estándar de adopción del contribuyente' },
    { id: 2, name: 'UNSPSC' },
    { id: 3, name: 'Partida Arancelaria' },
    { id: 4, name: 'GTIN' }
  ]);
  
  
  const fetchTributeOptions = async () => {
    try {
      const response = await getData('/v1/tributes/products?name=&code=');
  
      if (response.data && Array.isArray(response.data)) {
        tributeOptions.value = response.data.map(item => ({
          label: `${item.code} - ${item.name}`,
          value: item.name
        }));
      } else {
        console.error('❌ Estructura inesperada en la respuesta:', response.data);
      }
    } catch (error) {
      console.error('❌ Error al obtener los tributos:', error);
    }
  };
  
  
  
  onMounted(async () => {
    getDatafromAPI();
    fetchUnitOptions();
    fetchTributeOptions();
  });
  
  
  
  </script>
  
  <style scoped>
  * {
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
    ;
    color: white;
    padding: 12px;
    text-align: center;
  }
  
  .q-form {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    
  }
  
  .modal-add {
    max-width: 800px;
    width: 100%;
  }
  
  /* Separador entre secciones */
  .q-separator {
    margin-bottom: 12px;
  }
  
  
  </style>