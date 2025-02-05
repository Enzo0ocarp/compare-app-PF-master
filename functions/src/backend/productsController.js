const axios = require("axios");

exports.getProducts = async (req, res) => {
  try {
    // Simulación de acceso a APIs de Carrefour y Coto
    const carrefour = await axios.get("URL_API_CARREFOUR");
    const coto = await axios.get("URL_API_COTO");

    const products = [...carrefour.data, ...coto.data];
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};
