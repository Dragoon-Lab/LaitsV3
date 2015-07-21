<?php
/**
 * Indents a flat JSON string to make it more human-readable.
 *
 * @param string $json The original JSON string to process.
 *
 * @return string Indented version of the original JSON string.
 * 
 * source : http://php.net/manual/en/function.json-encode.php
 *
 */
function json_format($json) 
{ 
    $tab = "    "; 
    $new_json = ""; 
    $indent_level = 0; 
    $in_string = false; 

    $json_obj = json_decode($json); 

    if($json_obj === false) 
        return false; 

    $json = json_encode($json_obj); 
    $len = strlen($json); 
	$notSkip = true;

    for($c = 0; $c < $len ; $c++) 
    { 
        $char = $json[$c];
		if(!($c+1 == $len))
			$nextChar = $json[$c+1];
		if($notSkip){
			switch($char) 
			{ 
				case '{': 
				case '[':
					
					if(!$in_string) 
					{ 
						if($nextChar == '}' || $nextChar == ']'){
							$new_json .= $char.$nextChar;
							$notSkip = false;
							break;
						} else {	
							$new_json .= $char . "\n" . str_repeat($tab, $indent_level+1); 
							$indent_level++; 
						} 
					}
					else 
					{ 
					    $new_json .= $char; 
				    } 
			        break; 
		        case '}': 
	            case ']': 
					if(!$in_string) 
					{ 
				        $indent_level--; 
			            $new_json .= "\n" . str_repeat($tab, $indent_level) . $char; 
		            } 
	                else 
					{ 
				        $new_json .= $char; 
			        } 
		            break; 
	            case ',': 
					if(!$in_string) 
					{ 
						$new_json .= ",\n" . str_repeat($tab, $indent_level); 
					} 
					else 
					{ 
				        $new_json .= $char; 
			        } 
		            break; 
	            case ':': 
				    if(!$in_string) 
					{ 
			            $new_json .= ": "; 
		            } 
	                else 
					{ 
						$new_json .= $char; 
					} 
					break; 
				case '"': 
					if($c > 0 && $json[$c-1] != '\\') 
					{ 
						$in_string = !$in_string; 
					} 
				default: 
					$new_json .= $char; 
				    break;                    
			}
		} else {
			$notSkip = true;
		}
    } 

    return $new_json; 
} 
?>
