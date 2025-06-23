# Generador Excel a TXT Bancario

Una aplicación web construida con React y Next.js que convierte tablas de Excel (`.xls`, `.xlsx`) con columnas **Numero de Cuenta**, **Importe** y **Nombre** en un archivo de texto plano con formato bancario de 108 caracteres por línea. La última línea del archivo siempre termina con un salto de línea.

---

## 📦 Características

* **Arrastre y selección** de archivos Excel.
* **Validación** de columnas obligatorias.
* **Procesamiento** de filas: secuencia de 9 dígitos, campos fijos, importe en centavos, nombre limpio (sin tildes/ñ) y sufijo `001001`.
* **Salto de línea final** garantizado en el archivo resultante.
* **Descarga** inmediata del archivo `.txt` nombrado `LOTE_BANCARIO_YYYY-MM-DD.txt`.
* **Notificaciones** tipo toast para estados de éxito o error.

---

## 🚀 Tecnologías

* [Next.js](https://nextjs.org) (App Router, Client Components)
* [React](https://reactjs.org) + [TypeScript](https://www.typescriptlang.org/)
* [xlsx](https://www.npmjs.com/package/xlsx) para leer y parsear Excel
* [file-saver](https://www.npmjs.com/package/file-saver) para descargar TXT
* [Sonner](https://sonner.vercel.app/) para toasts
* [Lucide-React](https://lucide.dev/) para iconos
* [Tailwind CSS](https://tailwindcss.com/) (usando shadcn/ui)

---

## 💻 Instalación y Desarrollo

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/excel-to-txt-generator.git
   cd excel-to-txt-generator
   ```

2. Instala dependencias:

   ```bash
   pnpm install      # o npm install, yarn
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   pnpm dev          # o npm run dev, yarn dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠️ Uso

1. Arrastra o haz clic en el área para cargar tu archivo Excel.
2. Presiona **Validar y Procesar Archivo**.
3. Cuando termine, habilita el botón **Descargar Archivo TXT**.
4. Descarga tu `.txt` con salto de línea al final.

---

## 📦 Producción

Para generar una versión optimizada:

```bash
pnpm build
```

Luego despliega la carpeta `.next/` en Vercel, Netlify, Amplify, etc.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Abre un *issue* o envía un *pull request* describiendo tu mejora.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.
