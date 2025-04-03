<template>
    <q-page padding>
      <h4>Clientes</h4>
      <hr>
      <div class="tittle">
        <q-input v-model="search" placeholder="Buscar producto" outlined dense clearable>
          <template v-slot:append>
            <q-btn flat icon="search" @click="getDatafromAPI" />
          </template>
        </q-input>
  
        <div class="add">
          <q-btn label="Crear" icon="person_add" @click="openDialog" class="crear"
            style="background-color: #007bff; color: white; border-radius: 6px; padding: 10px 20px; font-weight: 600;" />
        </div>
      </div>
  
      <!-- tabla principal -->
      <q-table flat bordered :rows="clientes.reverse()" :columns="columns" row-key="id" >
        <template v-slot:header="props">
          <tr>
            <th v-for="col in props.cols" :key="col.name" class="tabla-header">
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
            <q-btn icon="edit" color="primary" flat @click="editCustomer(props.row)" class="q-mr-sm" />
            <q-btn :icon="props.row.state === 1 ? 'remove_circle' : 'check_circle'"
              :color="props.row.state === 1 ? 'negative' : 'positive'" flat @click="showConfirmationState(props.row)" />
          </q-td>
        </template>
      </q-table>
  
  
      <!-- Modal de Registro de Cliente -->
      <q-dialog v-model="dialog" persistent transition-show="slide-up" transition-hide="slide-down">
        <q-card class="q-pa-md shadow-3" style="max-width: 700px; width: 100%;">
          <!-- Encabezado -->
          <q-card-section class="bg-primary text-white row items-center justify-between">
            <div class="text-h6">Registrar Cliente</div>
            <q-btn dense flat icon="close" v-close-popup />
          </q-card-section>
  
          <q-card-section>
            <q-form @submit.prevent="saveCustomer">
              <!-- Tipo de Organización -->
              <q-select v-model="form.legal_organization_id" :options="organizationTypes" label="Tipo de organización"
                option-value="id" option-label="name" emit-value map-options outlined dense
                @update:model-value="handleOrganizationChange" class="full-width" />
  
              <!-- Campos en 2 columnas -->
              <div class="row q-col-gutter-md">
                <!-- Persona Jurídica -->
                <q-input v-if="form.legal_organization_id === 1" v-model="form.company" label="Razón Social" class="col-6"
                  outlined dense />
                <q-input v-if="form.legal_organization_id === 1" v-model="form.trade_name" label="Nombre Comercial"
                  class="col-6" outlined dense />
  
                <!-- Persona Natural -->
                <q-input v-if="form.legal_organization_id === 2" v-model="form.names" label="Nombre Completo"
                  class="col-12" outlined dense />
  
                <!-- Información General -->
                <q-select v-model="form.identification_document_id" :options="documentTypeOptions"
                  label="Tipo de documento" class="col-6" outlined dense emit-value map-options />
                <q-input v-model="form.identification" label="Identificación" class="col-6" outlined dense />
  
                <q-select v-model="form.tribute_id" :options="tributeOptions" label="Tributo" class="col-6" outlined dense
                  emit-value map-options />
                <q-input v-model="form.address" label="Dirección" class="col-6" outlined dense />
  
                <q-input v-model="form.email" label="Correo Electrónico" type="email" class="col-6" outlined dense />
                <q-input v-model="form.phone" label="Teléfono" type="tel" class="col-6" outlined dense />
  
                <!-- Municipio -->
                <q-select v-model="form.municipality_id" :options="municipalityOptions" label="Municipio" class="col-12"
                  outlined dense emit-value map-options />
              </div>
  
              <!-- Botón de Guardar -->
              <div class="q-mt-lg row justify-end" style="margin-top: 20px;">
                <q-btn label="Guardar Cliente" type="submit" color="primary" icon="save" @click="saveCustomer" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
  
      <!-- modal de edicion-->
      <q-dialog v-model="modalEditCustomer" persistent transition-show="slide-up" transition-hide="slide-down">
        <q-card class="q-pa-md shadow-3" style="max-width: 700px; width: 100%;">
          <q-card-section class="bg-primary text-white row items-center justify-between">
            <div class="text-h6">Editar Cliente</div>
            <q-btn dense flat icon="close" v-close-popup />
          </q-card-section>
  
          <q-card-section>
            <q-form @submit.prevent="saveCustomer">
              <!-- Tipo de Organización -->
              <q-select v-model="dataEditCustomer.legal_organization_id" :options="organizationTypes"
                label="Tipo de organización" option-value="id" option-label="name" emit-value map-options outlined dense
                @update:model-value="handleOrganizationChange" class="full-width" />
  
              <!-- Campos en 2 columnas -->
              <div class="row q-col-gutter-md">
                <!-- Persona Jurídica -->
                <q-input v-if="dataEditCustomer.legal_organization_id === 1" v-model="dataEditCustomer.company"
                  label="Razón Social" class="col-6" outlined dense />
                <q-input v-if="dataEditCustomer.legal_organization_id === 1" v-model="dataEditCustomer.trade_name"
                  label="Nombre Comercial" class="col-6" outlined dense />
  
                <!-- Persona Natural -->
                <q-input v-if="dataEditCustomer.legal_organization_id === 2" v-model="dataEditCustomer.names"
                  label="Nombre Completo" class="col-12" outlined dense />
  
                <!-- Información General -->
                <q-select v-model="dataEditCustomer.identification_document_id" :options="documentTypeOptions"
                  label="Tipo de documento" class="col-6" outlined dense emit-value map-options />
                <q-input v-model="dataEditCustomer.identification" label="Identificación" class="col-6" outlined dense />
  
                <q-select v-model="dataEditCustomer.tribute_id" :options="tributeOptions" label="Tributo" class="col-6"
                  outlined dense emit-value map-options />
                <q-input v-model="dataEditCustomer.address" label="Dirección" class="col-6" outlined dense />
  
                <q-input v-model="dataEditCustomer.email" label="Correo Electrónico" type="email" class="col-6" outlined
                  dense />
                <q-input v-model="dataEditCustomer.phone" label="Teléfono" type="tel" class="col-6" outlined dense />
  
                <!-- Municipio -->
                <q-select v-model="dataEditCustomer.municipality_id" :options="municipalityOptions" label="Municipio"
                  class="col-12" outlined dense emit-value map-options />
              </div>
  
              <!-- Botón de Guardar -->
              <div class="q-mt-lg row justify-end" style="margin-top: 20px;">
                <q-btn label="Guardar Cliente" type="submit" color="primary" icon="save" @click="updateCustomer"
                  :loading="loading" />
              </div>
            </q-form>
  
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-page>
  
  </template>
  
  <script setup>
  
  import { ref, onMounted } from 'vue';
  import { getData, } from '../services/apiClient';
  import { backgetData, backpostData, backputData } from '../services/backClient';
  import { Notify } from 'quasar';
  import Swal from 'sweetalert2';
  
  
  
  
  const columns = [
    { name: 'names', required: true, label: 'Nombre', align: 'left', field: row => row.company || row.names, sortable: true },
    { name: 'identification', required: true, label: 'Identificación', align: 'left', field: row => row.identification, sortable: true },
    { name: 'email', label: 'Correo Electrónico', align: 'left', field: row => row.email, sortable: true },
    { name: 'phone', label: 'Teléfono', align: 'center', field: row => row.phone, sortable: true },
    { name: 'municipality_id', label: 'Ciudad', align: 'center', field: row => row.municipality_id, sortable: true, },
    { name: 'address', label: 'Dirección', align: 'center', field: row => row.address, sortable: true },
    { name: 'state', label: 'Estado', align: 'center', field: row => row.state, sortable: true, style: "font-weight: bold;" },
    { name: 'actions', label: 'Acciones', align: 'center', field: 'actions', sortable: false },
  ];
  
  
  // listar en tabla principal
  
  const clientes = ref([]);
  const dialog = ref(false);
  const search = ref('');
  const municipalityOptions = ref([]);
  const loading = ref(false);
  
  async function getDatafromAPI() {
    loading.value = true;
    try {
      const response = await backgetData('customer');
      clientes.value = response;
      console.log(response);
    } catch (error) {
  
      console.error('Error cargando clientes:', error);
    }
    finally {
      loading.value = false;
    }
  }
  
  // crear Cliente
  
  const openDialog = () => {
    dialog.value = true;
    console.log(dialog.value);
  }
  
  
  const form = ref({
    legal_organization_id: null,
    identification: '',
    dv: '',
    company: '',
    trade_name: '',
    names: '',
    address: '',
    email: '',
    phone: '',
    tribute_id: '',
    identification_document_id: null,
    municipality_id: null,
  
  });
  
  
  
  const organizationTypes = [
    { id: 1, name: 'Persona Jurídica' },
    { id: 2, name: 'Persona Natural' },
  ]
  
  const tributeOptions = ref([
    { label: 'IVA', value: 18 },
    { label: 'No aplica', value: 21 }
  ]);
  
  const documentTypeOptions = ref([
    { label: 'Registro civil', value: 1 },
    { label: 'Tarjeta de identidad', value: 2 },
    { label: 'Cédula de ciudadanía', value: 3 },
    { label: 'Tarjeta de extranjería', value: 4 },
    { label: 'Cédula de extranjería', value: 5 },
    { label: 'NIT', value: 6 },
    { label: 'Pasaporte', value: 7 },
    { label: 'Documento de identificación extranjero', value: 8 },
    { label: 'PEP', value: 9 },
    { label: 'NIT otro país', value: 10 },
    { label: 'NUIP', value: 11 }
  ]);
  
  const handleOrganizationChange = () => {
    if (form.value.legal_organization_id === 1) {
      // Si es Persona Jurídica, vaciar el campo 'names'
      form.value.names = '';
    } else {
      // Si es Persona Natural, vaciar campos de empresa y nombre comercial
      form.value.company = '';
      form.value.trade_name = '';
    }
  }
  
  // Guardar cliente
  
  const saveCustomer = async () => {
    loading.value = true;
    const newCustomer = {
      ...form.value,
      identification: String(form.value.identification),
      municipality_id: Number(form.value.municipality_id),
      legal_organization_id: Number(form.value.legal_organization_id),
      tribute_id: Number(form.value.tribute_id),
      identification_document_id: Number(form.value.identification_document_id),
    };
  
    try {
  
      const response = await backpostData('customer', newCustomer);
      console.log(response);
  
      dialog.value = false;
      Notify.create({
        message: 'Cliente guardado exitosamente',
      });
      await getDatafromAPI();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
    finally {
      loading.value = false;
    }
  };
  
  
  // edicion de cliente
  
  const modalEditCustomer = ref(false);
  const editCustomer = (customer) => {
    dataEditCustomer.value = customer;
    modalEditCustomer.value = true;
  }
  
  const dataEditCustomer = ref({
    identification: '',
    dv: '',
    company: '',
    trade_name: '',
    names: '',
    address: '',
    email: '',
    phone: '',
    tribute_id: '',
    identification_document_id: '',
    municipality_id: null
  });
  
  const updateCustomer = async () => {
    loading.value = true;
    const newCustomer = {
      ...dataEditCustomer.value,
      identification: String(dataEditCustomer.value.identification),
      municipality_id: Number(dataEditCustomer.value.municipality_id),
      legal_organization_id: Number(dataEditCustomer.value.legal_organization_id),
      tribute_id: Number(dataEditCustomer.value.tribute_id),
  
    };
    try {
      const response = await backputData(`customer/${dataEditCustomer.value._id}`, newCustomer);
      console.log(response);
      modalEditCustomer.value = false;
      Notify.create({
        message: 'Cliente actualizado exitosamente',
      })
      await getDatafromAPI();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
    finally {
      loading.value = false;
    }
  };
  
  
  // confirmation state
  const confirmChangeState = async (customer) => {
    if (!customer) return;
  
    customer.state = customer.state === 1 ? 0 : 1;
  
    try {
  
      await backputData(`customer/${customer._id}`, { state: customer.state });
  
      Notify.create({
        message: 'Estado actualizado con éxito',
      });
  
      await getDatafromAPI(); // Refresca los datos
  
    } catch (error) {
      console.error('Error al cambiar el estado:', error.response ? error.response.data : error.message);
    }
  
  };
  
  // Mostrar alerta de confirmación
  const showConfirmationState = (customer) => {
  
    Swal.fire({
      title: '¿Estás seguro de cambiar el estado?',
      text: 'estas a punto de cambiar el estado del cliente',
  
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar', loading: loading.value
    }).then((result) => {
      if (result.isConfirmed) {
        confirmChangeState(customer);
      }
    });
  
  };
  
  
  //endpoints
  
  const fetchMunicipalityOptions = async () => {
    try {
  
      const response = await getData('/v1/municipalities?name=&code=');
      if (response.data && Array.isArray(response.data)) {
        municipalityOptions.value = response.data.map(item => ({
          label: item.name,
          value: item.id
        }));
      } else {
        console.error('❌ Estructura inesperada en la respuesta:', response.data);
      }
    } catch (error) {
      console.error('❌ Error al obtener los datos:', error);
    }
  };
  
  
  
  
  
  onMounted(async () => {
    getDatafromAPI();
    fetchMunicipalityOptions();
  });
  </script>
  
  <style scoped>
  * {
    margin: 0%;
    box-sizing: border-box;
    font-family: 'NunitSans', sans-serif;
    font-size: 11px;
  }
  
  .q-page-container {
    padding: 0%;
    padding-left: 0%;
    background-color: #37465a;
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
    ;
    color: white;
    padding: 12px;
    text-align: center;
  }
  
  .table-header {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: left;
    padding: 10px;
  }
  
  /* Mejor organización del formulario */
  .full-width {
    width: 100%;
  }
  </style>