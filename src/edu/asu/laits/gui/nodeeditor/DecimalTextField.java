package edu.asu.laits.gui.nodeeditor;

import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.text.Format;
import javax.swing.JFormattedTextField;

/*
 * DecimalTextField class
 * 
 * @author Joshua Claxton
 * @version 20120119
 */

//This class allows the input of only numbers, backspace, and a single decimal point
//Solves bug 58 so that international keyboards are compatable as well
public class DecimalTextField extends JFormattedTextField {

    // after it was decided that a comma should be allowed as input, it was added to this list
    private final static String goodChars = "0123456789.,-\b"; //allowable input
    
    //constructors- do the same thing as the parent class
    public DecimalTextField(){
        super();
    }
    public DecimalTextField(Format format){
        super(format);
    }
    public DecimalTextField(JFormattedTextField.AbstractFormatter formatter){
        super(formatter);
    }
    public DecimalTextField(JFormattedTextField.AbstractFormatterFactory factory){
        super(factory);
    }
    public DecimalTextField(JFormattedTextField.AbstractFormatterFactory factory, Object currentValue){
        super(factory, currentValue);
    }
    public DecimalTextField(Object value){
        super(value);
   }
     

    @Override
    public void processKeyEvent(KeyEvent ev) {
      
      // 37 = left arrow
      // 39 = right arrow
      if (ev.getKeyCode() == 37 || ev.getKeyCode() == 39){       
        
        super.processKeyEvent(ev); // process the key event like normal
      }
      else 
      {
        char c = ev.getKeyChar();
        //consume all characters which are not numbers, decimals, or backspaces
        if(goodChars.indexOf(c) <= -1) 
        {
            ev.consume();
            return;
        }
        //if the character is a decimal, consume ONLY IF a decimal has already been entered.
        if (c == '.' && getText().indexOf(c) > -1)
        {
          ev.consume();
          return;
        } else if (c == '-' && getText().indexOf(c) > -1)
        {
          ev.consume();
          return;
        }

        //otherwise process key event as normal
        else 
        {      
          super.processKeyEvent(ev);
        }
      }
   }
    
    
    
    @Override
    public void processMouseEvent(MouseEvent ev){
      super.processMouseEvent(ev);
//      setCaretPosition(getText().length());//don't want user to arbitrarily place cursor        
      
    }

}
