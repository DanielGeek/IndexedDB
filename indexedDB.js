

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;


        var dataBase = null;
        
        // Crear funcion bd
        function startDB() {
            
            //crear bd
            dataBase = indexedDB.open("myabakus");
            console.log(dataBase);

            dataBase.onupgradeneeded = function (e) {
                //recuperar la conexión activa a nuestra base de datos
                active = dataBase.result;

                //crear almacen people con llave id
                object = active.createObjectStore("people", { keyPath : 'id', autoIncrement : true });

                //crear indices byname, by_dni
                object.createIndex('byname', 'name', { unique : false });
                object.createIndex('by_dni', 'dni', { unique : true });
            };

            //si carga correctamente la bd ejecutar un alert
            dataBase.onsuccess = function (e) {
               console.log('Base de datos cargada correctamente');
               loadAll();
            };

            //si no carga correctamente la bd ejecutar un alert
            dataBase.onerror = function (e) {
                alert('Error cargando la base de datos');
            };    
            
        }

        //funcion para agregar datos a la bd
        function add() {
            var active = dataBase.result;

            //activamos lectura/escritura en el almacen people
            var data = active.transaction(["people"], "readwrite");
            //activa el modo en el almcen people
            var object = data.objectStore("people");
            
            //agregamos la data en forma de objeto
            var request = object.put({
                dni: document.querySelector("#dni").value,
                name: document.querySelector("#name").value,
                surname: document.querySelector("#surname").value
            });

            //no se ha introducido la propiedad “id” puesto que es un valor autoincremental 

            //verificar errores como by_dni duplicado, mostramos un aler con el nombre del error
            request.onerror = function (e) {
                
                alert(request.error.name + '\n\n' + request.error.message);
                
            };

            //si se completa la transaccion vaciamos los inputs y crearmos un alert
            data.oncomplete = function (e) {
                document.querySelector("#dni").value = '';
                document.querySelector("#name").value = '';
                document.querySelector("#surname").value = '';
                alert('Objeto agregado correctamente');
                loadAll();
            };
        }

        // función  loadAll para recuperar los objetos de nuestra BD IndexedDB
        function loadAll() {

            var active = dataBase.result;
            var data = active.transaction(["people"], "readonly");
            var object = data.objectStore("people");

            var elements = [];

            //recorrer almacen
            object.openCursor().onsuccess = function (e) {
                
                //recuperamos el objeto
                var result = e.target.result;

                if(result === null) {
                    return;
                }
                
                elements.push(result.value);
                result.continue();
                
            };

            data.oncomplete = function() {
                
                var outerHTML = '';

                for(var key in elements) {

                    outerHTML += '\n\
                    <tr>\n\
                         <th scope="row">'+elements[key].id+'</th>\n\
                        <td>' + elements[key].dni + '</td>\n\
                        <td>' + elements[key].name + '</td>\n\
                        <td>\n\
                            <button type="button" onclick="load('+ elements[key].id + ')">Details</button>\n\
                        </td>\n\
                        </tr>';
                }

                elements = [];
                document.querySelector("#elementsList").innerHTML = outerHTML;
            };
        }

        

