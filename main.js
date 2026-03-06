// ------------------- INICIO ESCENA -------------------
class InicioScene extends Phaser.Scene {

    constructor(){
        super("InicioScene"); // Nombre de la escena
    }

    preload(){
        // Carga la imagen del fondo para la pantalla de inicio
        this.load.image("fondoInicio","../img/fondo.png");
    }

    create(){
        // Agrega la imagen de fondo y ajusta su tamaño al canvas
        this.add.image(0,0,"fondoInicio")
            .setOrigin(0) // Para que la posición (0,0) sea la esquina superior izquierda
            .setDisplaySize(this.scale.width, this.scale.height); // Se adapta a cualquier pantalla

        // Título del juego
        this.add.text(180,200,"TRIVIA DE PATOS",{
            fontSize:"35px",
            color:"#e77b00"
        }).setOrigin(0.5); // Centrado

        // Botón de comenzar
        let boton = this.add.rectangle(180,300,200,60,0x550000)
            .setInteractive(); // Lo hace clickeable

        this.add.text(180,300,"COMENZAR",{
            fontSize:"20px"
        }).setOrigin(0.5);

        // Evento al presionar el botón
        boton.on("pointerdown",()=>{
            this.scene.start("TriviaScene",{ 
    vidas: 3,
    puntaje: 0,
    indice: 0 }); 
        });

    }
}

// ------------------- ESCENA DEL JUEGO -------------------
class TriviaScene extends Phaser.Scene {

    constructor(){
        super("TriviaScene");
    }

    init(data){
        // Inicializa variables con valores enviados o por defecto
        this.vidas = data.vidas ?? 3; 
        this.puntaje = data.puntaje ?? 0;
        this.indice = data.indice ?? 0;
    }

    preload(){
        // Carga la imagen de fondo del juego
        this.load.image("fondoJuego","../img/fondo.png");
    }

    create(){
        // Fondo adaptado a cualquier pantalla
        this.add.image(0,0,"fondoJuego")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Arreglo de preguntas
        this.preguntas = [
            {pregunta:"¿Que comen los patos?", opciones:["Pastel","Picafresas","Frutas y verduras","Almas"], correcta:2},
            {pregunta:"¿Que no puede hacer un pato ?", opciones:["Volar","Nadar","Correr","El mal "], correcta:3},
            {pregunta:"¿Que tiene que tener el espacio de un pato si o si ?", opciones:["Agua","Una tele","Tenis","Pistola"], correcta:0}
        ];

        // Texto de vidas y puntaje
        this.textoVidas = this.add.text(20,20,"🦆".repeat(this.vidas),{fontSize:"22px"});
        this.textoPuntaje = this.add.text(240,20,"Puntos: "+this.puntaje,{fontSize:"22px",
             color:"#000000"
        });
      
        // Muestra la primera pregunta
        this.mostrarPregunta();
    }

    mostrarPregunta(){
        if(this.indice >= this.preguntas.length){
            this.scene.start("FinalScene",{gano:true,puntaje:this.puntaje});
            return;
        }

        let actual = this.preguntas[this.indice];

        // Mostrar la pregunta centrada
        this.textoPregunta = this.add.text(180,150,actual.pregunta,{
            fontSize:"20px",
            color:"#000000",
            wordWrap:{width:300},
            align:"center"
        }).setOrigin(0.5);

        this.botones = [];

        // Crear botones para las opciones
        for(let i=0;i<4;i++){
            let boton = this.add.rectangle(180,250+i*80,300,60,0x222222)
                .setInteractive();

            let texto = this.add.text(180,250+i*80,actual.opciones[i],{
                fontSize:"18px"
            }).setOrigin(0.5);

            boton.on("pointerdown",()=>{ this.verificar(i); });

            this.botones.push(boton);
        }

        // Temporizador de la pregunta
        this.tiempoRestante = 10;
        this.textoTiempo = this.add.text(150,20,"⏳ 10",{fontSize:"22px",
            color:"#000000"
        });

        this.temporizador = this.time.addEvent({
            delay: 1000,
            callback: ()=>{
                this.tiempoRestante--;
                this.textoTiempo.setText("⏳ " + this.tiempoRestante);

                if(this.tiempoRestante <= 0){
                    this.temporizador.remove();
                    this.vidas--;
                    this.textoVidas.setText("🦆".repeat(this.vidas));
                    this.efectoRojo();

                    if(this.vidas <= 0){
                        this.scene.start("FinalScene",{gano:false,puntaje:this.puntaje});
                        return;
                    }

                    this.indice++;
                    this.time.delayedCall(800,()=>{
                        this.scene.restart({
                            vidas:this.vidas,
                            puntaje:this.puntaje,
                            indice:this.indice
                        });
                    });
                }
            },
            loop: true
        });
    }

    verificar(respuesta){
        let actual = this.preguntas[this.indice];
        this.temporizador.remove();

        if(respuesta === actual.correcta){
            this.puntaje++;
            this.textoPuntaje.setText("Puntos: "+this.puntaje);
            this.efectoVerde();
        }else{
            this.vidas--;
            this.textoVidas.setText("🦆".repeat(this.vidas));
            this.efectoRojo();

            if(this.vidas <= 0){
                this.scene.start("FinalScene",{gano:false,puntaje:this.puntaje});
                return;
            }
        }

        this.indice++;
        this.time.delayedCall(800,()=>{
            this.scene.restart({
                vidas:this.vidas,
                puntaje:this.puntaje,
                indice:this.indice
            });
        });
    }

    efectoRojo(){
        let overlay = this.add.rectangle(180,320,360,640,0xff0000,0.4);
        this.tweens.add({targets: overlay, alpha: 0, duration: 400, onComplete: ()=> overlay.destroy()});
    }

    efectoVerde(){
        let overlay = this.add.rectangle(180,320,360,640,0x00ff00,0.3);
        this.tweens.add({targets: overlay, alpha: 0, duration: 300, onComplete: ()=> overlay.destroy()});
    }
}

// ------------------- ESCENA FINAL -------------------
class FinalScene extends Phaser.Scene {
    constructor(){ super("FinalScene"); }

    init(data){
        this.gano = data.gano;
        this.puntaje = data.puntaje;

        // Calcula estrellas según puntaje
        let estrellas = 0;
        if(this.puntaje >= 3) estrellas = 3;
        else if(this.puntaje === 2) estrellas = 2;
        else if(this.puntaje === 1) estrellas = 1;

        let textoEstrellas = "⭐".repeat(estrellas);
        this.add.text(180,360,textoEstrellas,{fontSize:"32px"}).setOrigin(0.5);
    }

    create(){
        this.cameras.main.setBackgroundColor("#189999");
        let mensaje = this.gano ? "🦆 GANASTE 🦆" : "🦆GAME OVER🦆";

        this.add.text(180,250,mensaje,{fontSize:"36px"}).setOrigin(0.5);
        this.add.text(180,320,"Puntaje: "+this.puntaje,{fontSize:"26px"}).setOrigin(0.5);

        // Botón de reinicio
        let boton = this.add.rectangle(180,420,200,60,0x550000).setInteractive();
        this.add.text(180,420,"REINICIAR",{fontSize:"20px"}).setOrigin(0.5);

        boton.on("pointerdown",()=>{ this.scene.start("InicioScene"); });
    }
}

// ------------------- CONFIGURACIÓN DEL JUEGO -------------------
const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    transparent: true,
    parent: "juego",
    scale:{
        mode: Phaser.Scale.FIT, // Ajusta el juego al tamaño de pantalla
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:[InicioScene,TriviaScene,FinalScene] //Indica en que orden se van a ejecutar las escenas
};

const game = new Phaser.Game(config);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then((registration) => {
        console.log("Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
        console.log("Error al registrar Service Worker:", error);
      });
  });
}