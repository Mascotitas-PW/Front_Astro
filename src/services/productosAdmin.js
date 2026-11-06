import { fetchGraphQL } from '../graphql/client';

const Q_PRODUCTOS = `
  query {
    productos { id nombre precio imagen stock categoriaId categoria }
  }`;

const Q_CATEGORIAS = `query { categorias { id nombre } }`;

const M_CREAR = `
  mutation ($input: ProductoInput!) {
    crearProducto(input: $input) { id }
  }`;

const M_ACTUALIZAR = `
  mutation ($id: Int!, $input: ProductoInput!) {
    actualizarProducto(id: $id, input: $input) { id }
  }`;

const M_ELIMINAR = `
  mutation ($id: Int!) {
    eliminarProducto(id: $id)
  }`;

// El formulario entrega strings; el backend espera números.
function aInput(d) {
  return {
    nombre: String(d.nombre ?? '').trim(),
    precio: Number(d.precio),
    imagen: d.imagen ?? '',
    stock: parseInt(d.stock, 10),
    categoriaId: Number(d.categoriaId),
  };
}

export async function listarProductosAdmin() {
  const d = await fetchGraphQL(Q_PRODUCTOS);
  return d.productos;
}

export async function listarCategorias() {
  const d = await fetchGraphQL(Q_CATEGORIAS);
  return d.categorias;
}

export async function crearProducto(datos) {
  await fetchGraphQL(M_CREAR, { input: aInput(datos) });
}

export async function actualizarProducto(id, datos) {
  await fetchGraphQL(M_ACTUALIZAR, { id, input: aInput(datos) });
}

export async function eliminarProducto(id) {
  await fetchGraphQL(M_ELIMINAR, { id });
}
