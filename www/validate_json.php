<?php
//error_reporting(0);
$ch=getcwd();
$dh=opendir($ch."\problems");
echo "<table cellspacing='2' border='1'><tr><th>name</th><th>parent nodes</th><th>non parent nodes</th></tr>";
while(false !== ($fn = readdir($dh))){
        $det=pathinfo($fn);
        if(isset($det["extension"]))
            if($det["extension"]=="json")
                {
                echo "<tr><td>".$fn."</td>";
                
                $fp=fopen($ch."\problems\\".$fn,"r");
                $vr=fread($fp,filesize($ch."\problems\\".$fn));
                $vr = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $vr);
                $jr=json_decode($vr);
                $pr=$jr->task->givenModelNodes;
                $str1=$str2=$str3="";
                foreach($pr as $pn){
                    if(isset($pn->parentNode)){
                    if($pn->parentNode==true){
                        $str1=$str1.$pn->name.",";
                    }
                    elseif($pn->parentNode==false){
                        $str2=$str2.$pn->name.",";
                    }
                }
                }
                if($str1!="")
                echo "<td>".$str1."</td>";
                else
                echo "<td bgcolor='#FF0000'></td>";
                echo "<td>".$str2."</td>";
              
                
    //exit;
    }}
    echo "</table>";
   
?>