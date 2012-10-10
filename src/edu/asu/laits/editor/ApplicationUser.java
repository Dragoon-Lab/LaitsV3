/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.editor;

/**
 *
 * @author ramayantiwari
 */
public class ApplicationUser {
  
  public static String getUserFirstName(){
    return firstName;
  }
  
  public static void setUserFirstName(String fName){
    firstName = fName;
  }
  
  public static String getUserLastName(){
    return lastName;
  }
  
  public static void setUserLastName(String lName){
    lastName = lName;
  }
  
  public static String getUserASUID(){
    return asuid;
  }
  
  public static void setUserASUID(String uid){
    asuid = uid;
  }
  
  public static boolean isUserValid(){
    return isValid;
  }
  
  public static void setUserValid(boolean input){
    isValid = input;
  }
  
  
  private static String firstName;
  private static String lastName;
  private static String asuid;
  
  private static boolean isValid = false;
}
