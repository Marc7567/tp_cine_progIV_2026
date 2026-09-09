Titulo del proyecto: Sistema de gestion y venta de entradas de cine.

Descripcion del proyecto: El proyecto consiste en desarrollar una aplicacion web para un establecimiento cinematografico, cuyo objetiivo es realizar consultas de peliculas, funciones, selecciones y compra de entradas, adquision de productos de la dulceria y gestionar los servicios ofrecidos por el cine.

La aplicacion permitira a los clientes consultar la cartelera, conocer informacion de las peliculas, consultar horarios y funciones disponibles, seleccionar butacas, realizar compras y recibir sus entradas en formato digital mediante archivo PDF con un codigo QR.

Tambien, se incorporaran funciones complementarias como reseñas de peliculas, cupones de descuento, programa de fidelidad, preventas, proximos estrenos, cancelacion por creditos y compra de productos en candy bar.

El sistema tambien tendra en cuenta usuarios registrados, anonimos, empleados y administradores, cada uno contara con diferentes funcionalidades y permisos segun su rol.

Desde el lado administrativo, se dispondrá de herramientas para gestionar películas, funciones, salas, butacas, productos, promociones y recompensas, además de reportes, estadísticas y registros de actividad.


Requerimientos funcionales:
1: Funciones generales de la pagina

1) El sistema deberá asignar automáticamente una sala disponible al crear una función, impidiendo que dos funciones ocupen la misma sala y horario.

2) El sistema deberá respetar un intervalo mínimo de 30 minutos entre el final de una función y el inicio de la siguiente función en una misma sala.

3) El sistema deberá impedir la compra de entradas cuando el usuario no cumpla la edad mínima requerida para una película y deberá indicar, cuando corresponda, que el menor deberá asistir acompañado por un adulto.

4) El sistema deberá actualizar la disponibilidad de las butacas en tiempo real e evitar que una misma butaca sea adquirida simultáneamente por diferentes usuarios para una misma función.

5) El sistema deberá diferenciar visualmente las butacas accesibles para personas con discapacidad en las filas J y K, y las VIP, indicando claramente las características de estas últimas antes de realizar el pago.

6) La página principal deberá mostrar las 3 películas más vendidas.

7) Cuando una película tenga la preventa habilitada, el sistema deberá permitir la venta de entradas desde siete días antes de su estreno, aplicar el precio especial durante dicho período y restablecer el precio normal una vez finalizada la preventa.

8) El sistema deberá calcular automáticamente los puntos correspondientes a las compras realizadas por usuarios registrados.

9) El sistema deberá generar un código QR único asociado a cada compra, que podrá ser utilizado por los empleados para validar las entradas y gestionar la entrega de los productos del Candy Bar.

10) El sistema deberá registrar las actividades importantes realizadas por administradores y empleados, indicando quién realizó la acción, qué acción realizó y la fecha y hora.

--------------
2: Funciones generales para usuarios (anonimos o registrados)

11) El usuario podrá consultar las películas disponibles en la cartelera, incluyendo su nombre, imagen, sinopsis, duración, géneros y clasificación de edad.

12) El usuario podrá consultar el detalle de una película, incluyendo su nombre, imagen, sinopsis, duración, géneros y clasificación de edad

13) El usuario podrá buscar películas mediante un buscador y filtrarlas por género.

14) El usuario podrá consultar la sección de películas próximas a estrenarse.

15) El usuario podrá consultar las funciones disponibles de una película, incluyendo fecha, hora, sala, modalidad e idioma.

16) El usuario podrá visualizar y seleccionar las butacas disponibles, identificando de manera diferenciada las butacas accesibles a personas con discapacidad y las butacas VIP.

17) El usuario podrá comprar entradas sin necesidad de registrarse.

18) El usuario podrá adquirir productos del Candy Bar y combos junto con sus entradas.

19) El usuario podrá visualizar de forma destacada los combos disponibles de entradas y productos del Candy Bar durante el proceso de compra.

20) El usuario podrá completar sus compras utilizando los medios de pago disponibles.

21) El usuario podrá obtener la entrada en formato PDF con los datos de la compra y el código QR correspondiente.

22) El usuario podrá calificar películas mediante estrellas y dejar un comentario corto.

23) El usuario podrá consultar las reseñas y la puntuación promedio de una película antes de sacar las entradas.

24) El usuario podrá consultar una sección de “Próximamente”, donde se mostrarán las películas que se estrenarán en las próximas semanas.

25) El usuario podrá activar una alerta para recibir una notificación cuando las entradas de una película próxima a estrenarse estén disponibles para la venta.

26) El usuario podrá adquirir entradas durante el período de preventa de una película cuando este se encuentre habilitado.

-----------------------------------------------------------------------
1.2: funciones para Usuarios registrados

27) El usuario podrá registrarse e iniciar sesión en el sistema.

28) El usuario registrado podrá consultar y gestionar su perfil, que contendrá sus datos personales (nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y días de vacaciones anuales), su  creditos disponible, puntos acumulados, historial de canjes y de peliculas vistas.

29) El usuario registrado obtendrá un descuento del 20% en su primera compra y podrá utilizar cupones de descuento cuando cumpla las condiciones correspondientes.  El porcentaje podra ser modificado por el administrador.

30) El usuario registrado podrá acumular un punto por cada peso gastado en sus compras, consultar sus puntos acumulados y canjearlos por entradas o productos del Candy Bar según las recompensas disponibles.

31) Los puntos serán personales y no podrán transferirse entre usuarios.

32) El usuario registrado podrá consultar una seccion "Mis peliculas", donde podra ver un historial de las películas que ha visto, incluyendo pósters, fechas y su propia calificación.

33) El usuario registrado podrá cancelar una compra hasta dos horas antes del comienzo de la función.

34) Las cancelaciones no generarán una devolución de dinero; el importe correspondiente se convertirá en crédito para futuras compras.

35) El usuario registrado puede usar su crédito con otros métodos de pago.

-----------------------------------------------------------------------
3: Funciones para Empleados

36) El empleado podrá iniciar sesión con una cuenta con permisos de empleado.

37) El empleado podrá validar entradas y entregas de productos del Candy Bar mediante el escaneo del código QR o mediante el ingreso manual del código cuando el escáner no esté disponible.

38) El sistema deberá informar al empleado si el código corresponde a una operación válida y, una vez utilizada la entrada o entregado el producto del Candy Bar, deberá impedir que la misma operación vuelva a utilizarse.

-----------------------------------------------------------------------
4: Funciones para Administradores

39) El administrador podrá determinar qué películas estaran disponibles en la página principal.

40) El administrador podrá crear, modificar y administrar películas, incluyendo nombre, imagen, sinopsis, duración y fecha de estreno.

41) El administrador podrá asociar uno o varios géneros a cada película y establecer su clasificación de edad.

42) El administrador podrá crear y administrar funciones indicando película, fecha, hora, modalidad e idioma.

43) El administrador podrá configurar las modalidades 2D, 3D, 4D y 5D, así como establecer si las funciones serán en castellano o subtituladas.

44) El administrador podrá establecer los días y horarios en los que se proyectará cada película.

45) El administrador podrá gestionar las salas y la distribución de sus butacas, incluyendo butacas normales, accesibles y VIP.

46) El administrador podrá configurar las butacas VIP correspondientes a las filas R, S y T y establecer su precio.

47) El administrador podrá crear, modificar y administrar los productos del Candy Bar, así como crear y gestionar las categorías a las que pertenecen.

48) El administrador podrá crear y administrar combos que incluyan entradas y productos del Candy Bar, así como configurar su precio.

49) El administrador podrá configurar el porcentaje del descuento de primera compra.

50) El administrador podrá crear y administrar cupones para usuarios mayores de 50 años.

51) El administrador podrá configurar las recompensas disponibles y establecer el costo en puntos de cada una.

52) El administrador podrá configurar la preventa de entradas para cada película, estableciendo su período y precio especial.

53) El administrador podrá consultar la facturación diaria y la cantidad de entradas vendidas.

54) El administrador podrá exportar los reportes de facturación y ventas en formato PDF y Excel.

55) El administrador podrá consultar gráficos sobre las películas más vistas por semana y por mes.

56) El administrador podrá consultar cuál es el producto más vendido del Candy Bar.

57) El administrador podrá consultar los registros de actividad realizados por administradores y empleados.