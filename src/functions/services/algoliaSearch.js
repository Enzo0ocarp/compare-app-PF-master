// src/functions/services/algoliaSearch.js - CORREGIDO
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_KEY;

let searchClient = null;
let productsIndex = null;

export const initAlgolia = () => {
  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
      searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
      productsIndex = searchClient.initIndex('products');
      console.log('✅ Algolia inicializado correctamente');
      return true;
    } catch (error) {
      console.warn('⚠️ Error inicializando Algolia:', error);
      return false;
    }
  }
  console.warn('⚠️ Algolia no configurado - usando búsqueda básica');
  return false;
};

export const searchWithAlgolia = async (query, filters = {}) => {
  if (!productsIndex) {
    throw new Error('Algolia no está inicializado');
  }

  try {
    const searchParams = {
      query,
      hitsPerPage: 50,
      filters: buildAlgoliaFilters(filters)
    };

    const { hits, nbHits } = await productsIndex.search(query, searchParams);
    
    return {
      products: hits.map(hit => ({
        id: hit.objectID,
        ...hit
      })),
      totalResults: nbHits
    };
  } catch (error) {
    console.error('❌ Error en búsqueda Algolia:', error);
    throw error;
  }
};

const buildAlgoliaFilters = (filters) => {
  const filterParts = ['activo:true'];
  
  if (filters.categoria) {
    filterParts.push(`categoria_principal:"${filters.categoria}"`);
  }
  
  if (filters.marca) {
    filterParts.push(`marca:"${filters.marca}"`);
  }
  
  if (filters.precioMin) {
    filterParts.push(`precio >= ${filters.precioMin}`);
  }
  
  if (filters.precioMax) {
    filterParts.push(`precio <= ${filters.precioMax}`);
  }
  
  return filterParts.join(' AND ');
};

export const isAlgoliaAvailable = () => {
  return productsIndex !== null;
};

export const indexProductInAlgolia = async (product) => {
  if (!productsIndex) return;
  
  try {
    await productsIndex.saveObject({
      objectID: product.id,
      nombre: product.nombre,
      marca: product.marca,
      precio: product.precio,
      categoria_principal: product.categoria_principal,
      activo: product.activo,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error indexando en Algolia:', error);
  }
};