import sys
import cv2
import numpy as np
import scipy
import tensorflow as tf
import keras

print("--- VERIFICACIÓN DE ENTORNO PYTHON ---")
print(f"Versión de Python: {sys.version.split()[0]}")
print(f"Versión de OpenCV: {cv2.__version__}")
print(f"Versión de NumPy:  {np.__version__}")
print(f"Versión de SciPy:  {scipy.__version__}")
print(f"Versión de TensorFlow: {tf.__version__}")
print(f"Versión de Keras:   {keras.__version__}\n")

#_P_ Prueba funcional básica usando OpenCV y NumPy
try:
    #_P_ 1. Crear una imagen negra de 300x300 píxeles con NumPy
    imagen = np.zeros((300, 300, 3), dtype="uint8")
    
    #_P_ 2. Dibujar un círculo verde usando OpenCV
    #_P_ (imagen, centro, radio, color BGR, grosor)
    cv2.circle(imagen, (150, 150), 75, (0, 255, 0), -1)
    
    #_P_ 3. Mostrar la imagen en una ventana externa
    print("Abriendo ventana de prueba con OpenCV... (Presiona cualquier tecla para cerrarla)")
    cv2.imshow("Prueba OpenCV con Exito", imagen)
    
    #_P_ Espera a que presiones una tecla y cierra la ventana
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    print("¡Todo funciona correctamente!")

except Exception as e:
    print(f"Ocurrió un error durante la prueba: {e}")
