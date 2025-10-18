// src/functions/services/algoliaSearch.js - VERSIÓN v5 CORREGIDA
import { searchClient } from '@algolia/client-search';

const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_KEY;

let client = null;
let isInitialized = false;

export const initAlgolia = () => {
  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY) {
    try {
      client = searchClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
      isInitialized = true;
      console.log('✅ Algolia inicializado correctamente');
      console.log('📊 App ID:', ALGOLIA_APP_ID);
      return true;
    } catch (error) {
      console.warn('⚠️ Error inicializando Algolia:', error);
      isInitialized = false;
      return false;
    }
  }
  console.warn('⚠️ Algolia no configurado - usando búsqueda básica');
  return false;
};

export const searchWithAlgolia = async (query, filters = {}) => {
  if (!client || !isInitialized) {
    throw new Error('Algolia no está inicializado');
  }

  try {
    const searchParams = {
      requests: [
        {
          indexName: 'products',
          query: query,
          hitsPerPage: 50,
          filters: buildAlgoliaFilters(filters),
          attributesToRetrieve: ['*'],
          attributesToHighlight: ['nombre', 'marca']
        }
      ]
    };

    const { results } = await client.search(searchParams);
    const firstResult = results[0];

    console.log('🎯 Algolia búsqueda exitosa:', firstResult.nbHits, 'resultados');
    
    return {
      products: firstResult.hits.map(hit => ({
        id: hit.objectID,
        nombre: hit.nombre || '',
        marca: hit.marca || '',
        precio: hit.precio || 0,
        categoria: hit.categoria_principal || 'Otros',
        categoria_principal: hit.categoria_principal || '',
        presentacion: hit.presentacion || '',
        sucursal: hit.sucursal || 'Varias',
        activo: hit.activo !== false,
        // Agregar todos los campos que necesites
        ...hit
      })),
      totalResults: firstResult.nbHits
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
  
  if (filters.precioMin && filters.precioMax) {
    filterParts.push(`precio:${filters.precioMin} TO ${filters.precioMax}`);
  } else if (filters.precioMin) {
    filterParts.push(`precio >= ${filters.precioMin}`);
  } else if (filters.precioMax) {
    filterParts.push(`precio <= ${filters.precioMax}`);
  }
  
  return filterParts.join(' AND ');
};

export const isAlgoliaAvailable = () => {
  return isInitialized && client !== null;
};

export const indexProductInAlgolia = async (product) => {
  if (!client || !isInitialized) {
    console.warn('Algolia no está inicializado, no se puede indexar');
    return;
  }
  
  try {
    await client.saveObject({
      indexName: 'products',
      body: {
        objectID: product.id,
        nombre: product.nombre,
        marca: product.marca,
        precio: product.precio,
        categoria_principal: product.categoria_principal,
        presentacion: product.presentacion,
        sucursal: product.sucursal,
        activo: product.activo,
        timestamp: Date.now()
      }
    });
    console.log('✅ Producto indexado en Algolia:', product.id);
  } catch (error) {
    console.error('❌ Error indexando en Algolia:', error);
  }
};

export default {
  initAlgolia,
  searchWithAlgolia,
  isAlgoliaAvailable,
  indexProductInAlgolia
};