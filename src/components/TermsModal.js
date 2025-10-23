// src/components/TermsModal.js
import React from 'react';
import '../styles/TermsModal.css';

const TermsModal = ({ isOpen, onClose, contentType, onAccept }) => {
  if (!isOpen) return null;

  const termsContent = (
    <div className="terms-content">
      <h2>TÉRMINOS Y CONDICIONES</h2>
      <p className="last-updated">Fecha de última actualización: 22/09/2025</p>

      <section>
        <h3>1. OBJETIVO DEL SERVICIO</h3>
        <p>
          Compare & Nourish es una plataforma web colaborativa que permite a los consumidores argentinos
          acceder a información nutricional confiable y comparar productos alimenticios para tomar decisiones
          informadas sobre qué comprar y qué comer.
        </p>
        <p>Nuestro servicio está dirigido a:</p>
        <ul>
          <li>Consumidores conscientes que buscan información transparente sobre productos alimentarios</li>
          <li>Familias que desean optimizar su alimentación y presupuesto</li>
          <li>Personas con necesidades dietarias específicas (veganos, celíacos, diabéticos, etc.)</li>
          <li>Usuarios interesados en contribuir a una base de datos colaborativa de información nutricional</li>
        </ul>
      </section>

      <section>
        <h3>2. CONDICIONES DE USO</h3>
        <h4>2.1 Comportamiento Aceptable</h4>
        <p>Los usuarios se comprometen a:</p>
        <ul>
          <li>Proporcionar información veraz y precisa al cargar datos de productos</li>
          <li>Respetar a otros usuarios y sus opiniones en reseñas y comentarios</li>
          <li>Utilizar la plataforma únicamente para fines legítimos de comparación alimentaria</li>
          <li>No crear múltiples cuentas para manipular calificaciones o reseñas</li>
          <li>Reportar información incorrecta o contenido inapropiado cuando lo identifiquen</li>
        </ul>

        <h4>2.2 Comportamiento Prohibido</h4>
        <p>Queda terminantemente prohibido:</p>
        <ul>
          <li>Subir información falsa o engañosa sobre productos</li>
          <li>Atacar marcas por su origen, tamaño o por prejuicios personales</li>
          <li>Crear reseñas falsas o manipular el sistema de calificaciones</li>
          <li>Utilizar la plataforma para fines comerciales no autorizados</li>
          <li>Difundir contenido discriminatorio, ofensivo o que promueva actividades ilegales</li>
          <li>Intentar acceder a datos no autorizados o comprometer la seguridad del sistema</li>
        </ul>

        <h4>2.3 Contribuciones de Usuarios</h4>
        <p>Al contribuir con datos nutricionales, reseñas o cualquier contenido:</p>
        <ul>
          <li>Garantizas que la información proviene de fuentes reales (envases, páginas oficiales)</li>
          <li>Otorgas a Compare & Nourish el derecho no exclusivo de usar, modificar y distribuir tu contribución</li>
          <li>Aceptas que tu contenido puede ser verificado y editado por otros usuarios o moderadores</li>
          <li>Mantienes la responsabilidad sobre la veracidad de la información proporcionada</li>
        </ul>
      </section>

      <section>
        <h3>3. RESPONSABILIDAD</h3>
        <h4>3.1 Limitaciones de Responsabilidad</h4>
        <p>Compare & Nourish actúa como intermediario de información y:</p>
        <ul>
          <li>No garantiza la exactitud completa de todos los datos nutricionales</li>
          <li>No se responsabiliza por decisiones de compra basadas en la información del sitio</li>
          <li>No asume responsabilidad por productos defectuosos o problemas de salud relacionados</li>
          <li>Se reserva el derecho de corregir errores identificados en un plazo máximo de 48 horas hábiles</li>
        </ul>

        <h4>3.2 Información Médica</h4>
        <ul>
          <li>No somos médicos ni nutricionistas profesionales</li>
          <li>La información nutricional no constituye asesoramiento médico</li>
          <li>Para dudas de salud específicas, siempre recomendamos consultar a un profesional</li>
          <li>Los usuarios con condiciones médicas deben verificar independientemente la información</li>
        </ul>

        <h4>3.3 Disponibilidad del Servicio</h4>
        <p>Nos esforzamos por mantener la plataforma disponible, pero:</p>
        <ul>
          <li>Pueden ocurrir interrupciones por mantenimiento o problemas técnicos</li>
          <li>No garantizamos disponibilidad 24/7 sin excepciones</li>
          <li>Los datos de precios pueden no estar actualizados en tiempo real</li>
        </ul>
      </section>

      <section>
        <h3>4. PROPIEDAD INTELECTUAL</h3>
        <h4>4.1 Contenido de Compare & Nourish</h4>
        <ul>
          <li>El diseño, estructura, algoritmos y funcionalidades de la plataforma son propiedad de Compare & Nourish</li>
          <li>El logo, nombre y marca están protegidos por derechos de autor y marcas registradas</li>
          <li>Está prohibida la reproducción o uso comercial sin autorización expresa</li>
        </ul>

        <h4>4.2 Contenido de Usuarios</h4>
        <ul>
          <li>Los usuarios mantienen los derechos sobre el contenido original que suben</li>
          <li>Al publicar contenido, otorgan licencia para su uso dentro de la plataforma</li>
          <li>Compare & Nourish puede usar datos agregados y anonimizados para análisis y mejoras</li>
        </ul>

        <h4>4.3 Contenido de Terceros</h4>
        <ul>
          <li>Respetamos los derechos de propiedad intelectual de marcas y fabricantes</li>
          <li>La información nutricional oficial pertenece a sus respectivos propietarios</li>
          <li>Utilizamos dicha información bajo principios de uso legítimo para comparación</li>
        </ul>
      </section>

      <section>
        <h3>5. MODIFICACIONES</h3>
        <h4>5.1 Actualización de Términos</h4>
        <ul>
          <li>Estos términos pueden ser actualizados para reflejar cambios en el servicio o la legislación</li>
          <li>Las modificaciones significativas se comunicarán con 15 días de anticipación</li>
          <li>Los usuarios serán notificados por email y mediante aviso visible en la plataforma</li>
          <li>El uso continuado del servicio implica aceptación de los nuevos términos</li>
        </ul>
      </section>

      <section>
        <h3>6. RESOLUCIÓN DE DISPUTAS</h3>
        <p>
          Para reportar problemas o disputas, contáctanos a través de{' '}
          <a href="mailto:etica@comparenourish.app">etica@comparenourish.app</a>
        </p>
      </section>

      <section>
        <h3>7. LEGISLACIÓN APLICABLE</h3>
        <p>
          Estos términos se rigen por las leyes de la República Argentina, específicamente:
          Ley de Defensa del Consumidor (Ley 24.240), Código Alimentario Argentino,
          y regulaciones de ANMAT sobre información nutricional.
        </p>
      </section>

      <section>
        <h3>8. CONTACTO</h3>
        <p>Para consultas sobre estos términos y condiciones:</p>
        <ul>
          <li>Email: <a href="mailto:legal@comparenourish.app">legal@comparenourish.app</a></li>
          <li>Formulario de contacto disponible en la plataforma</li>
        </ul>
      </section>
    </div>
  );

  const privacyContent = (
    <div className="terms-content">
      <h2>POLÍTICA DE PRIVACIDAD</h2>
      <p className="last-updated">Fecha de última actualización: 22/09/2025</p>

      <section>
        <h3>1. INTRODUCCIÓN</h3>
        <p>
          En Compare & Nourish, tu privacidad es nuestra prioridad. Esta política explica de manera clara
          y transparente cómo recopilamos, usamos, protegemos y compartimos tu información personal.
        </p>
      </section>

      <section>
        <h3>2. INFORMACIÓN QUE RECOPILAMOS</h3>
        <h4>2.1 Información que nos proporcionas directamente:</h4>
        <ul>
          <li>Datos de registro: nombre, apellido, email, fecha de nacimiento</li>
          <li>Perfil opcional: foto, bio, preferencias dietarias</li>
          <li>Contenido generado: reseñas, comentarios, datos nutricionales que cargas</li>
          <li>Comunicaciones: emails o mensajes que envías a soporte</li>
        </ul>

        <h4>2.2 Información que recopilamos automáticamente:</h4>
        <ul>
          <li>Datos de uso: productos que buscas, comparas o marcas como favoritos</li>
          <li>Información técnica: tipo de dispositivo, navegador, dirección IP</li>
          <li>Cookies y tecnologías similares para mejorar tu experiencia</li>
        </ul>
      </section>

      <section>
        <h3>3. CÓMO USAMOS TU INFORMACIÓN</h3>
        <ul>
          <li>Proporcionar y mejorar nuestros servicios</li>
          <li>Personalizar tu experiencia en la plataforma</li>
          <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
          <li>Garantizar la seguridad y prevenir fraudes</li>
          <li>Cumplir con obligaciones legales</li>
          <li>Realizar análisis y estadísticas agregadas</li>
        </ul>
      </section>

      <section>
        <h3>4. COMPARTIR TU INFORMACIÓN</h3>
        <h4>4.1 Información pública:</h4>
        <ul>
          <li>Las reseñas que escribes son públicas (bajo tu nombre de usuario)</li>
          <li>Los datos nutricionales que cargas benefician a toda la comunidad</li>
          <li>Estadísticas generales sin identificarte personalmente</li>
        </ul>

        <h4>4.2 No vendemos tu información:</h4>
        <p>
          Compare & Nourish NUNCA vende, alquila o comercializa tu información personal a terceros.
        </p>
      </section>

      <section>
        <h3>5. TUS DERECHOS</h3>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tu información personal</li>
          <li>Corregir datos incorrectos</li>
          <li>Solicitar la eliminación de tu cuenta y datos</li>
          <li>Exportar tus datos en formato legible</li>
          <li>Revocar consentimientos previos</li>
          <li>Oponerte al procesamiento de ciertos datos</li>
        </ul>
        <p>
          Para ejercer estos derechos, contáctanos a{' '}
          <a href="mailto:privacidad@comparenourish.app">privacidad@comparenourish.app</a>
        </p>
      </section>

      <section>
        <h3>6. SEGURIDAD</h3>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tu información,
          incluyendo encriptación de datos sensibles y controles de acceso estrictos.
        </p>
      </section>

      <section>
        <h3>7. COOKIES Y TECNOLOGÍAS SIMILARES</h3>
        <p>
          Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales
          para mejorar tu experiencia. Puedes gestionar tus preferencias en la configuración
          de tu navegador.
        </p>
      </section>

      <section>
        <h3>8. PRIVACIDAD DE MENORES</h3>
        <ul>
          <li>Compare & Nourish está dirigido a usuarios mayores de 13 años</li>
          <li>Los menores entre 13-18 años necesitan supervisión parental</li>
          <li>No recopilamos deliberadamente datos de menores de 13 años</li>
        </ul>
      </section>

      <section>
        <h3>9. CAMBIOS EN ESTA POLÍTICA</h3>
        <p>
          Podemos actualizar esta política para reflejar cambios en nuestras prácticas.
          Te notificaremos por email y mediante aviso en la plataforma sobre cambios significativos.
        </p>
      </section>

      <section>
        <h3>10. CONTACTO</h3>
        <p>Para preguntas sobre privacidad:</p>
        <ul>
          <li>Email: <a href="mailto:privacidad@comparenourish.app">privacidad@comparenourish.app</a></li>
          <li>Respuesta garantizada en: Máximo 5 días hábiles</li>
        </ul>
      </section>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-body">
          {contentType === 'terms' ? termsContent : privacyContent}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          {onAccept && (
            <button className="btn-primary" onClick={onAccept}>
              <i className="fas fa-check"></i>
              Aceptar y Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;