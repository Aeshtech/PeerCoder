export const defaultJavaCode =
  'public class Main {\n\npublic static void main(String[] args) {\n  int rows = 5;\n  for (int i = 1; i <= rows; ++i) {  //Outer loop for rows\n    for (int j = 1; j <= i; ++j) { //Inner loop for Col\n      System.out.print("* "); //Print *\n    }\n    System.out.println(); //New line\n  }\n}\n};';
